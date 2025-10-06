# Kanbreeze Design Document

## 1. Purpose & Scope
Kanbreeze は、カンバンとスクラムのハイブリッド運用を支援するプロジェクト管理サービスであり、親しみ感のある落ち着いた明るい色合いとアクセシビリティを重視した UI を提供します。本ドキュメントでは、`docs/specs` に定義された要件を満たすためのシステム全体の設計方針、主要コンポーネント、データモデル、および横断的な設計判断を示します。

## 2. Reference Requirements
- [Dashboard Requirements](./dashboard/requirements.md)
- [Kanban Board Requirements](./kanban-board/requirements.md)
- [Product Backlog Requirements](./product-backlog/requirements.md)
- [Sprint Management Requirements](./sprint-manage/requirements.md)
- [Ticket List Requirements](./ticket-list/requirements.md)
- [Ticket Detail Requirements](./ticket-detail/requirements.md)
- [Project Management Requirements](./project-manage/requirements.md)
- [User Management Requirements](./user-manage/requirements.md)
- [Profile Requirements](./profile/requirements.md)
- [Report Requirements](./report/requirements.md)

## 3. Product Vision & Experience Principles
- **安心感のあるテーマとアクセシビリティ**: すべての画面で落ち着いた明るさのカラーパレットと色覚多様性に配慮した表示を保つ。テーマプリセットやライト/ダーク自動切り替え、コントラスト警告をサポートすることで、カンバンやバックログなどの操作で安心して作業できる体験を実現する。
- **状況把握の即時性**: ダッシュボード、レポート、リスト表示は常に最新情報を即時反映し、未読通知・期日間近・リスク指標を強調する。
- **コラボレーションと監査性**: ユーザー管理の多様なロールとスコープ制御、履歴・監査ログ、リアルタイム反映（ソフトリフレッシュ・楽観的更新）を通じて、人間とエージェントの協調を安全に支援する。

## 4. System Architecture Overview
Kanbreeze はモジュール型の Web アプリケーションとして構築し、以下のコンポーネントで構成する。

| Layer | Primary Components | Responsibilities |
| --- | --- | --- |
| Presentation | Web クライアント (SPA) / SSR 対応フロントエンド | UI トークンとテーマ適用、リアルタイム更新、フォーム/ドラッグ&ドロップ操作、オフライン対応キャッシュ、アクセシビリティサポート |
| Application | GraphQL/REST API Gateway、WebSocket/Server-Sent Events (SSE) | 認証・認可、入力検証、ユースケース実行、リアルタイム配信、バックエンドサービスの統合 |
| Domain Services | プロジェクト、スプリント、チケット、バックログ、レポート、ユーザー/組織管理 | ビジネスルール、状態遷移（例: カード移動、スプリント進行、ポイント集計）、ドメインイベント発行 |
| Data & Integration | RDBMS、全文検索エンジン、オブジェクトストレージ、通知サービス | 永続化（トランザクション）、検索フィルタリング、ファイル添付、メール/チャット通知、外部認証 IdP |

### 4.1 Deployment Topology
- **API サーバー**: ステートレスなコンテナで水平スケールし、認証・RBAC・ABAC を実装。
- **リアルタイムハブ**: WebSocket/SSE をホストして、カード移動や並び替えなど即時反映が必要なイベントを配信。
- **バックグラウンドワーカー**: レポート集計、通知送信、監査ログ処理、添付ファイルのセキュアストレージ転送を担当。
- **データストア**: PostgreSQL 等の RDBMS を中心に、全文検索や分析用途に OpenSearch/ClickHouse を追加。オブジェクトストレージに添付ファイル・画像を保管。

### 4.2 Integration Boundaries
- 認証統合 (SAML/OIDC、API キー、デバイスバインドトークン) を Identity Provider と連携。
- 外部通知チャネル (メール、Webhook、チャットツール) への連携をメッセージキューを通じて非同期化。
- 監査ログは集中ログストレージに保管し、改ざん防止ハッシュを付与。

## 5. Domain Model
| Entity | Key Attributes | Relationships | Notes |
| --- | --- | --- | --- |
| **Organization** | name, plan, settings | has many Projects, Teams, Users | マルチテナントの隔離単位。SSO 設定や IP 制限を保持。 |
| **Team** | name, color, default_role | belongs to Organization; has many Users, Projects | チーム単位で権限テンプレートと通知設定を管理。 |
| **User** | profile, preferences, auth_method | belongs to Organization; many-to-many Teams | 人間・API クライアント・CLI エージェントを統一管理。MFA やデバイス情報を保持。 |
| **RoleAssignment** | role, scopes | belongs to User & Project/Team | RBAC/ABAC の付与情報。 |
| **Project** | key, name, workflow_settings | belongs to Organization; has many Boards, Sprints, BacklogItems, Tickets | カンバン列構成、WIP 制限、スプリントカレンダーを設定。 |
| **Board** | columns, theme_tokens | belongs to Project; has many Tickets | カンバン表示の構成とテーマ。 |
| **BacklogItem** | title, priority, estimate, value_scores | belongs to Project; may link to Sprint & Ticket | プロダクトバックログ項目、ドラフト状態を許容。 |
| **Sprint** | name, start/end, capacity, goals | belongs to Project; has many Tickets/BacklogItems | バーンダウンや進捗を計算。 |
| **Ticket** | title, status, assignee, due_date, tags, checklist | belongs to Project; may link to Sprint, BacklogItem, Report | カード/課題の中心情報。楽観的更新に対応。 |
| **Comment** | body, author, attachments | belongs to Ticket | Markdown レンダリングとファイル添付をサポート。 |
| **ReportSnapshot** | metrics, filters, generated_at | belongs to Project/Sprint | レポートの集計結果とハイライト設定。 |
| **Notification** | channel, template, read_state | belongs to User | 期日、メンション、権限更新などを配信。 |
| **AuditEvent** | actor, action, target, diff | belongs to Organization | 重要操作の追跡と保持期間を管理。 |

## 6. Module Design Overview
### 6.1 Dashboard
- **目的**: ユーザーの役割に応じた情報（マイタスク、期日が近い項目、未読メンション、KPI カード、スプリント状況、横断プロジェクト比較）を即時に可視化する。
- **データ取得**: API はユーザーのロールと最近のアクティビティをもとに、タスク/チケット/スプリント/レポートの集約クエリを提供。遅延時にはスケルトンを返す。
- **インタラクション**: レイアウト保存、折りたたみ、プロジェクトカードリンク遷移、スプリントの状態別 CTA を実装。

### 6.2 Kanban Board
- **テーマ設定**: プリセット適用、ライト/ダーク自動切り替え、コントラスト警告、色覚配慮パレットを UI トークンで管理。ユーザー設定はローカル/サーバー双方に保存。
- **カード操作**: ドラッグ&ドロップ、並び替え、インライン作成・編集、ショートカット対応、取り消し/やり直しをサポート。操作は Optimistic UI とサーバー確定で同期。
- **視覚メタファ**: タグ・期日バッジ・担当者・チェックリスト・アバター・進捗バー・添付ファイル表示を組み合わせ、アクセシビリティ（ツールチップ、アイコン二重符号化）を担保。
- **WIP & ルール**: 列ごとの WIP 制限、禁止状態へのドロップ制御、並行編集時の整合性保持（最後に確定した結果をブロードキャスト）。

### 6.3 Product Backlog
- **入力体験**: タイトルのみのドラフト保存、インライン詳細編集、Markdown プレビュー、画像アップロード、進行中インジケーター。
- **優先度・スコアリング**: ドラッグでの並び替え、自動保存、High/Medium/Low の優先度セクション化、ビジネス価値/緊急度/リスク低減スコアの総合点算出とハイライト表示。
- **スプリント連携**: 見積りプリセット、キャパシティ警告、一括スプリント移動、見積り確度アイコン、レポートとのデータ連携。

### 6.4 Sprint Management
- **スプリント計画**: キャパシティ設定、ゴール記述、ポイント集計、バーンダウンチャート生成。バックログ項目の一括割当と警告をサポート。
- **進行トラッキング**: 残日・コミットポイント・完了ポイントを API が集計し、ダッシュボードやレポートと共有。スプリント状態遷移（計画中 → 進行中 → レビュー → 完了）を定義し、遷移時に通知・レポート生成をトリガー。
- **レトロスペクティブ**: チームのメトリクス、課題、アクションアイテムを保持し、完了後のレポートにリンク。

### 6.5 Ticket List & Detail
- **リスト表示**: 多軸フィルタ（プロジェクト、スプリント、担当、期日、タグ、ステータス）、列表示カスタマイズ、保存ビュー、バルク操作、インクリメンタル検索。
- **詳細ビュー**: カードのメタ情報、リレーション（親チケット/子チケット/バックログ項目）、チェックリスト進捗、コメントスレッド、履歴タイムライン、関連ファイル、メンション通知。
- **共同編集**: 同時編集中のロック表示、ドラフト保存、差分マージ、楽観的コメント投稿。

### 6.6 Project Management
- **プロジェクト設定**: 基本情報、キー、ワークフロー列、WIP 制限、テンプレート、ボードとバックログの既定表示を管理。
- **メンバー管理**: ロール割当、アクセスレベル、レビュー必須ポリシー、統合設定（リポジトリ、通知チャネル）。
- **リスク・ヘルス指標**: KPI カード、リスク一覧、リソース使用率などダッシュボードとの連携データを保持。

### 6.7 User & Organization Management
- **認証**: メール&パスワード + MFA、SAML/OIDC SSO、API キー、デバイスバインドトークン。ロックアウト、IP 許可リストを適用。
- **招待 & アクティベーション**: 招待メール、一意トークン、有効期限、プロファイル入力、API クライアント申請承認。
- **権限モデル**: ロール（オーナー/管理者/メンバー/閲覧者）とスコープ（操作許可、プロジェクト制限）を RBAC/ABAC で評価。監査イベントを生成。
- **組織構造**: マルチテナント、チーム階層、ライセンスプラン、利用状況メトリクス。

### 6.8 Profile & Personalization
- **プロフィール編集**: 名前、アイコン、連絡先、タイムゾーン、通知設定。デバイス管理やログイン履歴を表示。
- **個人設定**: テーマプリセット、ショートカットカスタマイズ、ビュー保存、アクセシビリティオプション（フォントサイズ、コントラスト、アニメーション制限）。

### 6.9 Reporting & Insights
- **レポート生成**: バーンダウン、ベロシティ、リソース利用率、優先度ギャップ、見積り確度などを集計。フィルタとハイライト件数を保持。
- **スケジュール**: 定期レポート、手動生成、エクスポート（CSV/PDF）。
- **データソース**: スプリント、バックログ、チケット履歴、通知イベントを参照し、履歴スナップショットを保持。

## 7. Cross-Cutting Concerns
- **認証・認可**: すべてのエンドポイントで OAuth 2.1／OIDC に準拠したアクセストークンを検証し、`policy-engine` マイクロサービスで RBAC/ABAC を評価する。CLI/AI エージェントは専用クライアントクレデンシャルを使用し、レビュー必須ポリシーや IP フィルタリングを API ゲートウェイで適用。セッション継続には短命リフレッシュトークンとデバイスバインドを組み合わせる。
- **監査 & ロギング**: 重要操作（カード移動、権限変更、設定更新）はドメインイベントとして `audit_stream` に発行し、バックグラウンドワーカーが JSON Lines 形式で集中ログストレージと改ざん防止ハッシュチェーンへ記録する。監査ビューとエクスポート API は OpenSearch から直接集計する。
- **リアルタイム更新**: WebSocket/SSE とイベントストリームでカード操作、並び替え、コメント、通知を即時配信。セッションハートビートを 30 秒ごとに送信し、アクセストークンのローテーションは双方向 RPC で再取得する。
- **オフライン & 障害耐性**: 楽観的 UI、ローカル下書き、自動再送。API は冪等性キーを受け付け、再試行時の重複作成を防止。クライアントは `service worker` と IndexedDB を利用して最大 72 時間の変更キューを保持し、復帰後に順序保証付きで再送する。
- **アクセシビリティ**: コントラスト比準拠、キーボード操作、スクリーンリーダー対応、アニメーション時間制限、二重符号化。Storybook と axe-core で CI チェックを実施し、ハイコントラストテーマではフォーカスリングを 3px に拡大する。
- **国際化**: テキストは i18n ライブラリで管理し、右から左言語への配慮、タイムゾーン変換を実装。翻訳ファイルは FormatJS のメッセージカタログで管理し、ロケール追加は GitHub Actions のローカリゼーションワークフローで自動検証する。
- **通知**: メール/アプリ内/プッシュを統一テンプレートで生成し、ユーザーごとのサブスクリプション設定を尊重。配信はキュー（BullMQ）経由でバックグラウンドワーカーがチャネル別レート制限を適用する。
- **セキュリティ**: CSRF/SQL Injection/XSS 対策、添付ファイルの AV スキャン、秘密情報の暗号化保管。Secret は HashiCorp Vault に格納し、アプリケーションは短命トークンで取得する。依存ライブラリは SCA（Dependency Track）で常時監視する。

## 8. Data Storage Design
- **RDBMS テーブル例**: `organizations`, `projects`, `boards`, `board_columns`, `tickets`, `ticket_tags`, `ticket_checklist_items`, `backlog_items`, `sprints`, `sprint_metrics`, `users`, `user_profiles`, `role_assignments`, `api_clients`, `audit_events`, `notifications`, `reports`, `report_snapshots`。
- **検索インデックス**: チケット・コメント・バックログ項目に全文検索インデックスを適用し、ラベル/タグ/ステータスでフィルタリング。
- **ファイル管理**: 添付ファイルは S3 互換ストレージに保存し、署名付き URL を発行。5MB 超のアップロード制限や MIME チェックを実施。

## 9. API Design Principles
- REST/GraphQL のハイブリッド。読み取り多発のダッシュボードやレポートは GraphQL 集約で効率化し、更新系は REST で冪等性キーを受け付ける。
- API はバージョン付与 (`/v1/`)、OpenAPI/SDL でスキーマ公開。
- バルク操作（ドラッグ&ドロップ並び替え、一括スプリント追加）は一括エンドポイントを提供し、整合性チェックとロールバックをサポート。
- Webhook/イベント API で外部連携を提供し、署名検証・リプレイ対策を実施。

## 10. Non-Functional Requirements
- **パフォーマンス**: 主要な一覧・ダッシュボードは P95 レイテンシ 500ms 以下、テーマ切替は 200ms 以内に適用。
- **可用性**: 本番 SLA 99.9%。重要サービスはマルチ AZ 構成。
- **スケーラビリティ**: 横方向スケール可能な stateless API とキュー処理で 1 万人規模の同時利用に対応。
- **監視**: メトリクス、トレース、ログを可視化し、主要 KPI（チケット作成成功率、通知遅延、SSO 連携エラー率）を監視。
- **テスト戦略**: ユニット/統合/契約テスト、UI のビジュアルリグレッション、アクセシビリティ自動テスト。

## 11. Deployment & Operations
- IaC (Terraform 等) で環境構築、CI/CD で自動テスト・セキュリティスキャンを必須化。
- ブルーグリーン or カナリアデプロイ、DB マイグレーションは段階的リリースで実施。
- 機密情報はシークレットマネージャーで管理し、ローテーションを自動化。
- インシデントレスポンス手順（検知、封じ込め、復旧、ポストモーテム）を整備。

## 12. Future Considerations
- AI アシスタントによるタスク提案やレトロスペクティブの自動要約。
- プラグイン/拡張ポイントの開放による外部連携の拡充。
- 分析基盤との統合による高度な予測分析や容量計画機能。

## 13. Theme Token System & Adaptive Modes

### 13.1 Token Foundations
Kanbreeze のテーマは CSS カスタムプロパティとして実装し、**Core（ベースカラー）** と **Semantic（意味付けカラー）** の二層構造で
提供する。トークンは `kb-color-{group}-{scale}`（0–100のライトネス段階）と `kb-semantic-{role}` の命名規則を採用する。

| Group | Sample Tokens | Purpose |
| --- | --- | --- |
| `core-primary` | `kb-color-core-primary-10` `kb-color-core-primary-50` `kb-color-core-primary-90` | アクション、強調ラベル。Soft Light テーマでは `#5B7BDA` を中心に 10=最淡、90=最濃。 |
| `core-neutral` | `kb-color-core-neutral-05` `kb-color-core-neutral-30` `kb-color-core-neutral-80` | 背景/境界線/テキスト。ライトモードは `#FFFFFF` 〜 `#1F2933`、ダークモードでは逆転。 |
| `core-accent` | `kb-color-core-accent-20` `kb-color-core-accent-60` | カードアクセント、タグ。Warm Pastel では `#FFB88C`、Calm Mint では `#67C8A3`。 |
| `core-status` | `kb-color-core-success-*` `kb-color-core-warning-*` `kb-color-core-danger-*` | 成功/警告/危険のベース。WCAG AA を維持するペアリングを定義。 |

Semantic レイヤは以下の対応で構成し、各テーマは Core レイヤから自動算出される。

| Semantic Token | Mapping Rule |
| --- | --- |
| `kb-semantic-surface` | ライト: `core-neutral-05`, ダーク: `core-neutral-90` |
| `kb-semantic-surface-elevated` | `surface` に 4% のアルファ/陰影を追加 |
| `kb-semantic-text-primary` | ライト: `core-neutral-80`, ダーク: `core-neutral-10` |
| `kb-semantic-text-inverse` | `text-primary` の 80% 輝度反転 |
| `kb-semantic-border` | `core-neutral-30`（ライト）または `core-neutral-70`（ダーク） |
| `kb-semantic-focus-ring` | `core-primary-50` を 2px 外側グローで適用 |
| `kb-semantic-info/success/warning/danger` | `core-status-*` から輝度 70 の組み合わせ |

### 13.2 Theme Presets
3 つのプリセットテーマは共通のデザイントークン構造を保ちつつ、ベースヒューとアクセントを切り替える。

| Theme | Primary Base | Accent Base | Supporting Notes |
| --- | --- | --- | --- |
| **Soft Light** | `#5B7BDA`（ブルーラベンダー系） | `#89CFF0` | 標準テーマ。コントラスト比 4.8:1 を確保。 |
| **Warm Pastel** | `#F08475` | `#FFB88C` | リーダー向け。背景は `core-neutral` のトーンを +5% 暖色寄せ。 |
| **Calm Mint** | `#3FA17F` | `#67C8A3` | 集中モード。通知バッジはコントラスト確保のため `#245744` を使用。 |

テーマはライト/ダーク双方のパレットを持ち、ダークでは `core-neutral` を反転させた上で彩度を 10% 抑制する。コントラスト検証は
ビルド時の Style Dictionary スクリプトで自動化し、閾値未達の場合は CI を失敗させる。

### 13.3 Color Vision Support
- **色覚特性モード（Deuteranopia/Protanopia/Tritanopia）**: `core-primary` のヒューを 30° シフトし、輝度差を 15% 強調する。
- **ハイコントラスト**: `kb-semantic-surface` を #101213、`kb-semantic-text-primary` を #FFFFFF に固定し、アイコンは二重符号
  化（形状+テキスト）を適用。
- **警告色補助**: 警告/危険の背景にはパターンテクスチャ（2px ストライプ）を追加して色依存を避ける。

### 13.4 Adaptive Behavior & Preference Storage
- **自動切替**: OS の `prefers-color-scheme` を初期値とし、ユーザー設定でライト/ダーク/自動/ハイコントラストを選択。変更は即時に
  `localStorage` とユーザープロファイル API (`PATCH /v1/users/{id}/preferences`) に保存する。
- **色覚モード**: プロフィール設定から選択し、アクセシビリティ API (`PATCH /v1/users/{id}/accessibility`) で永続化。クライアントは
  初期ロード時にモード別 CSS を遅延読み込みする。
- **テーマ共有**: プロジェクトテンプレートと連動し、プロジェクト管理画面から `PUT /v1/projects/{id}/theme` で配布。個人設定との差異
  は差分マージし、競合時はユーザー優先。

### 13.5 Implementation Checklist
1. Style Dictionary または Tailwind CSS のカスタムテーマでトークンをビルドし、各テーマ毎に CSS 変数ファイルを出力する。
2. React アプリでは `ThemeProvider` を拡張し、`prefers-reduced-motion` と `prefers-contrast` をフックして 0.2–0.3 秒のトランジショ
   ンを適用する。
3. Storybook で各テーマ/モードのビジュアルリグレッションテストを実施し、ダーク/ハイコントラストでのフォーカスリング可視性を自動
   チェックする。
4. QA 手順として、カラーコントラストツールによる WCAG AA 準拠確認と、色覚シミュレーターでのテーマ検証をリリース前に義務化する。


## 14. Real-time & Offline Experience Architecture

### 14.1 API Gateway & Streaming Strategy
- **API Gateway**: BFF (Backend for Frontend) として GraphQL/REST ハイブリッドを提供し、認証済み WebSocket ハンドシェイクを仲介する。Gateway は HTTP/2 を前提とし、`/realtime` エンドポイントで WebSocket、SSE は `/events` で提供する。
- **Event Bus**: ドメインサービスは Kafka 互換の `kanbreeze-events` を利用して `ticket.updated`, `board.reordered`, `comment.created` などのイベントを発行。リアルタイムハブはトピックのコンシューマーとして動作し、プロジェクト/ボード単位でサブスクリプションをフィルタリングする。
- **Optimistic UI**: クライアントは操作ごとに一意の `clientMutationId` を付与し、即時にローカル状態を更新。サーバー確定後はイベントの `mutationId` 照合で差分を統合し、衝突時は `conflict-resolution` チャンネルでパッチを提示する。

### 14.2 Offline Sync & Resilience
- **Service Worker**: PWA として登録し、`/api/v1/**` の POST/PUT/PATCH は Background Sync キューに保存。オンライン復帰時に FIFO で再送し、冪等性トークンで重複を抑止する。
- **Local Drafts**: チケットコメントやバックログ入力は IndexedDB に下書きを保存し、最後に成功した同期時刻を保持。ユーザーは「ローカル変更を表示」ダイアログで衝突解決を行える。
- **Reconnect Strategy**: 通信断検知後は指数バックオフ（1s, 3s, 9s, 27s）で再接続を試行し、5 回失敗した場合は通知センターに警告を表示。バックグラウンドワーカーは失敗したジョブを Dead Letter Queue に移し、運用ダッシュボードで監視する。

### 14.3 Notification Fan-out
- **Subscription Preferences**: ユーザー設定 API (`/v1/users/{id}/subscriptions`) でチャンネル別（メール、アプリ内、プッシュ）の ON/OFF と quiet hours を管理。Gateway はリクエストコンテキストに適用済み設定を添付する。
- **Delivery Workers**: メールは SES 互換 API、プッシュは Web Push（VAPID）、アプリ内は WebSocket/SSE。失敗時はバックオフし、3 回連続失敗した場合はサポートアラートを発報。通知テンプレートは Mustache で定義し、ロケール・アクセシビリティ情報（テキスト読み上げ向け代替）を差し込む。

## 15. Security, Compliance & Globalization Blueprint

### 15.1 Authentication & Authorization Stack
- **Identity Providers**: メール+MFA は TOTP/Passkey、企業連携は OIDC/SAML をサポートし、Just-in-Time プロビジョニングでユーザーを作成する。API クライアントは OAuth 2.1 Client Credentials として登録し、Scope は `projects:read` `tickets:write` など細粒度に設定する。
- **Policy Evaluation**: Open Policy Agent (OPA) を Sidecar として導入し、GraphQL/REST リゾルバーから Rego ポリシーを照会。RBAC はロール付与、ABAC は属性（プロジェクト、チーム、タグ、リスクレベル）で制御し、決定ログを監査ストリームに残す。
- **Session Security**: リフレッシュトークンは回転型、検証失敗時は即座に全セッション無効化。デバイスバインドは WebAuthn キーと組み合わせ、未登録端末では追加の MFA を要求する。

### 15.2 Auditability & Operational Controls
- **Audit Event Schema**: `actor`, `actor_type`, `action`, `target`, `metadata.diff`, `request_id`, `ip_address`, `user_agent`, `result` を必須項目とし、すべての更新 API で生成。監査ログは 7 年保管し、WORM ストレージに週次アーカイブを取得する。
- **Compliance Hooks**: 変更承認が必要なプロジェクトでは、AI/CLI エージェント操作に `requires_review` フラグを付与し、承認ワークフローが完了するまで WebSocket 配信を遅延させる。アクセス権変更は Slack/Webhook でセキュリティチームに通知。
- **Secret Management**: HashiCorp Vault (KV v2) にアプリシークレットを保存し、CI/CD は短命トークンで取得。機密ファイルは KMS でエンベロープ暗号化し、監査証跡を CloudTrail 互換ログに残す。

### 15.3 Internationalization & Accessibility Operations
- **Localization Pipeline**: 翻訳キーは monorepo の `packages/i18n` に集約し、Phrase 等の TMS と GitHub Actions で同期。Lint で未翻訳キーを検出し、ビルド失敗とする。
- **RTL & Formatting**: React コンポーネントは `dir` 属性をロケールに応じて切替え、日付・数値は `Intl` API で表示。タイムゾーンはユーザープロファイル設定とブラウザ情報を突合して自動選択。
- **Accessibility Governance**: WCAG 2.2 AA 達成を目標とし、Design System の Figma トークンと Storybook Docs を連携。ユーザーテストはスクリーンリーダー（NVDA/VoiceOver）とキーボードオンリー操作を四半期ごとに実施し、レポートを監査ログに保存する。


