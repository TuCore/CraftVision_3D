using System.Text.Json;
using CraftVision.Application.Interfaces;
using CraftVision.CardSharing;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Gateway;

public sealed class CardPurchaseRecorder(
    IOrderService orders,
    ILogger<CardPurchaseRecorder> logger) : ICardPurchaseRecorder
{
    public Task RecordPaidPurchase(
        Guid ownerId,
        Guid cardId,
        long orderCode,
        int amount,
        string templateSlug,
        DateTime paidAt,
        CancellationToken ct) =>
        orders.RecordPaidCardPurchaseAsync(ownerId, cardId, orderCode, amount, templateSlug, paidAt);

    public async Task<int> ReconcilePaidPurchases(CardDatabase cards, CancellationToken ct = default)
    {
        var purchases = await cards.Payments
            .Join(
                cards.Cards.Where(card => card.PaidAt.HasValue),
                payment => payment.CardId,
                card => card.Id,
                (payment, card) => new
                {
                    Card = card,
                    payment.OrderCode,
                    payment.Amount
                })
            .ToListAsync(ct);

        var reconciled = 0;
        foreach (var purchase in purchases)
        {
            try
            {
                var templateSlug = JsonSerializer.Deserialize<JsonElement>(purchase.Card.DraftJson)
                    .GetProperty("template")
                    .GetString()!;
                await RecordPaidPurchase(
                    purchase.Card.OwnerId,
                    purchase.Card.Id,
                    purchase.OrderCode,
                    purchase.Amount,
                    templateSlug,
                    purchase.Card.PaidAt!.Value,
                    ct);
                reconciled++;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to reconcile paid card {CardId} into order history.", purchase.Card.Id);
            }
        }

        return reconciled;
    }
}
