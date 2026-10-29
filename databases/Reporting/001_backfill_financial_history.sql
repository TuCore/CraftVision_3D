-- Forward-only snapshot of surviving history. Product payment/refund dates are deliberately unknown.
-- No parent or child rows are deleted; FK RESTRICT remains in force.
UPDATE orders SET paid_at = created_at
WHERE order_kind = 'DigitalCard' AND payment_status::text = 'Paid' AND paid_at IS NULL;

INSERT INTO order_financial_events
    (id, order_id, user_id, order_code, order_kind, payment_method, kind, occurred_at, recorded_at, merchandise_amount, shipping_amount)
SELECT gen_random_uuid(), id, user_id, order_code, order_kind, payment_method::text, 'Receipt', paid_at,
    CURRENT_TIMESTAMP, GREATEST(total_amount - shipping_fee, 0), shipping_fee
FROM orders WHERE payment_status::text IN ('Paid', 'Refunded')
ON CONFLICT (order_id, kind) DO NOTHING;

INSERT INTO order_financial_lines (id, event_id, product_key, product_name, quantity, amount)
SELECT gen_random_uuid(), e.id, oi.product_id::text, COALESCE(p.name, oi.product_id::text), oi.quantity, oi.sub_total
FROM order_financial_events e JOIN order_items oi ON oi.order_id = e.order_id
LEFT JOIN products p ON p.id = oi.product_id
WHERE e.kind = 'Receipt' AND e.order_kind = 'Product';

INSERT INTO order_financial_lines (id, event_id, product_key, product_name, quantity, amount)
SELECT gen_random_uuid(), e.id, COALESCE(o.card_template_slug, 'unknown'), COALESCE(o.card_template_slug, 'Thiệp số'), 1, e.merchandise_amount
FROM order_financial_events e JOIN orders o ON o.id = e.order_id
WHERE e.kind = 'Receipt' AND e.order_kind = 'DigitalCard';

INSERT INTO order_financial_events
    (id, order_id, user_id, order_code, order_kind, payment_method, kind, occurred_at, recorded_at, merchandise_amount, shipping_amount)
SELECT gen_random_uuid(), e.order_id, e.user_id, e.order_code, e.order_kind, e.payment_method, 'Refund', o.refunded_at,
    CURRENT_TIMESTAMP, e.merchandise_amount, e.shipping_amount
FROM order_financial_events e JOIN orders o ON o.id = e.order_id
WHERE e.kind = 'Receipt' AND o.payment_status::text = 'Refunded'
ON CONFLICT (order_id, kind) DO NOTHING;

INSERT INTO order_financial_lines (id, event_id, product_key, product_name, quantity, amount)
SELECT gen_random_uuid(), refund.id, line.product_key, line.product_name, line.quantity, line.amount
FROM order_financial_events refund JOIN order_financial_events receipt ON receipt.order_id = refund.order_id AND receipt.kind = 'Receipt'
JOIN order_financial_lines line ON line.event_id = receipt.id WHERE refund.kind = 'Refund';
