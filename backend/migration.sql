START TRANSACTION;
CREATE TABLE ai_3d_requests (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    task_type character varying(20) NOT NULL,
    tripo_task_id character varying(255),
    status character varying(50) NOT NULL,
    idempotency_key character varying(128) NOT NULL,
    locked_by character varying(128),
    locked_until timestamp with time zone,
    credit_cost integer NOT NULL,
    uploaded_file_id uuid,
    model_version character varying(50),
    result_model_url text,
    error_message text,
    progress integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT pk_ai_3d_requests PRIMARY KEY (id),
    CONSTRAINT fk_ai_3d_requests_uploaded_files_uploaded_file_id FOREIGN KEY (uploaded_file_id) REFERENCES uploaded_files (id),
    CONSTRAINT fk_ai_3d_requests_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_ai_3d_requests_idempotency_key ON ai_3d_requests (idempotency_key);

CREATE INDEX ix_ai_3d_requests_status_locked_until ON ai_3d_requests (status, locked_until) WHERE status IN ('queued', 'running');

CREATE UNIQUE INDEX ix_ai_3d_requests_tripo_task_id ON ai_3d_requests (tripo_task_id);

CREATE INDEX ix_ai_3d_requests_uploaded_file_id ON ai_3d_requests (uploaded_file_id);

CREATE INDEX ix_ai_3d_requests_user_id ON ai_3d_requests (user_id);

INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
VALUES ('20260707152102_AddAi3dRequestTable', '10.0.9');

COMMIT;

