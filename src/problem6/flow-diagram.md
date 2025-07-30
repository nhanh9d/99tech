# Scoreboard System Flow Diagrams

## 1. Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WC[Web Client]
        MC[Mobile Client]
    end
    
    subgraph "API Gateway"
        LB[Load Balancer]
        AG[API Gateway/Nginx]
    end
    
    subgraph "Application Layer"
        AS1[API Server 1]
        AS2[API Server 2]
        AS3[API Server N]
        WS1[WebSocket Server 1]
        WS2[WebSocket Server 2]
    end
    
    subgraph "Cache Layer"
        RC[Redis Cluster]
        RP[Redis Pub/Sub]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL Master)]
        PGR1[(PostgreSQL Replica 1)]
        PGR2[(PostgreSQL Replica 2)]
    end
    
    subgraph "Security Layer"
        AUTH[Auth Service]
        VAL[Validation Service]
    end
    
    WC --> LB
    MC --> LB
    LB --> AG
    AG --> AS1
    AG --> AS2
    AG --> AS3
    AG --> WS1
    AG --> WS2
    
    AS1 --> AUTH
    AS2 --> AUTH
    AS3 --> AUTH
    
    AS1 --> VAL
    AS2 --> VAL
    AS3 --> VAL
    
    AS1 --> RC
    AS2 --> RC
    AS3 --> RC
    
    AS1 --> PG
    AS2 --> PG
    AS3 --> PG
    
    WS1 --> RP
    WS2 --> RP
    
    RC --> RP
    
    PG --> PGR1
    PG --> PGR2
    
    style WC fill:#e1f5fe
    style MC fill:#e1f5fe
    style RC fill:#ffecb3
    style RP fill:#ffecb3
    style PG fill:#c8e6c9
    style AUTH fill:#ffcdd2
    style VAL fill:#ffcdd2
```

## 2. Score Update Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant API as API Server
    participant Auth as Auth Service
    participant Val as Validation Service
    participant DB as PostgreSQL
    participant Cache as Redis Cache
    participant PS as Redis Pub/Sub
    participant WS as WebSocket Server
    participant OC as Other Clients
    
    U->>C: Complete Action
    C->>API: POST /api/score/update<br/>(JWT + Action Token)
    
    API->>Auth: Verify JWT Token
    Auth-->>API: Token Valid
    
    API->>Val: Validate Action Token<br/>& Score Increment
    Val->>Val: Check Rate Limits
    Val->>Val: Verify HMAC Signature
    Val->>Val: Check Anomaly Patterns
    Val-->>API: Validation Result
    
    alt Validation Failed
        API-->>C: 403 Forbidden
    else Validation Passed
        API->>DB: BEGIN Transaction
        DB->>DB: Update users.current_score
        DB->>DB: INSERT score_history
        DB->>DB: Mark action_token as used
        DB-->>API: COMMIT Transaction
        
        API->>Cache: Update user:score:{userId}
        API->>Cache: Invalidate scoreboard:top10
        API->>Cache: Calculate new top 10
        
        API->>PS: Publish score:update event
        PS-->>WS: Broadcast event
        
        WS-->>C: score:personal:update
        WS-->>OC: scoreboard:update
        
        API-->>C: 200 OK (New Score + Rank)
    end
```

## 3. Real-time WebSocket Connection Flow

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting: User Opens App
    Connecting --> Authenticating: WebSocket Connected
    Authenticating --> Authenticated: JWT Valid
    Authenticating --> Disconnected: JWT Invalid
    
    Authenticated --> Subscribed: Subscribe to Scoreboard
    Subscribed --> ReceivingUpdates: Listening
    
    ReceivingUpdates --> ReceivingUpdates: Receive scoreboard update
    ReceivingUpdates --> ReceivingUpdates: Receive personal score update
    
    ReceivingUpdates --> Reconnecting: Connection Lost
    Reconnecting --> Authenticating: Reconnected
    Reconnecting --> Disconnected: Max Retries Exceeded
    
    Authenticated --> Disconnected: User Logout
    Subscribed --> Disconnected: User Logout
    ReceivingUpdates --> Disconnected: User Logout
```

## 4. Action Token Generation and Validation Flow

```mermaid
flowchart LR
    subgraph "Action Start"
        A1[User Starts Action] --> A2[Request Action Token]
        A2 --> A3[Generate Token]
        A3 --> A4[Store in Redis<br/>TTL: 5 min]
        A4 --> A5[Return Token to Client]
    end
    
    subgraph "Action Completion"
        B1[User Completes Action] --> B2[Create Action Proof]
        B2 --> B3[Sign with HMAC]
        B3 --> B4[Send Score Update]
    end
    
    subgraph "Validation"
        C1[Receive Update Request] --> C2{Token Exists?}
        C2 -->|No| C3[Reject: Invalid Token]
        C2 -->|Yes| C4{Token Used?}
        C4 -->|Yes| C5[Reject: Duplicate]
        C4 -->|No| C6{HMAC Valid?}
        C6 -->|No| C7[Reject: Invalid Signature]
        C6 -->|Yes| C8{Within Time Limit?}
        C8 -->|No| C9[Reject: Expired]
        C8 -->|Yes| C10[Accept & Process]
    end
    
    A5 --> B1
    B4 --> C1
```

## 5. Caching Strategy Flow

```mermaid
graph TD
    subgraph "Read Path"
        R1[Client Request Scoreboard] --> R2{Cache Hit?}
        R2 -->|Yes| R3[Return Cached Data]
        R2 -->|No| R4[Query Database]
        R4 --> R5[Update Cache<br/>TTL: 5 seconds]
        R5 --> R6[Return Data]
    end
    
    subgraph "Write Path"
        W1[Score Update] --> W2[Update Database]
        W2 --> W3[Invalidate Cache]
        W3 --> W4[Publish Update Event]
        W4 --> W5[Recalculate Top 10]
        W5 --> W6[Update Cache]
    end
    
    subgraph "Cache Warming"
        C1[Scheduled Job<br/>Every 30 seconds] --> C2[Query Top 100 Users]
        C2 --> C3[Warm Cache]
    end
```

## 6. Security Check Flow

```mermaid
flowchart TD
    S1[Incoming Request] --> S2{Has JWT?}
    S2 -->|No| S3[401 Unauthorized]
    S2 -->|Yes| S4{JWT Valid?}
    S4 -->|No| S5[401 Unauthorized]
    S4 -->|Yes| S6{Rate Limit OK?}
    S6 -->|No| S7[429 Too Many Requests]
    S6 -->|Yes| S8{Action Token Valid?}
    S8 -->|No| S9[403 Forbidden]
    S8 -->|Yes| S10{Score Increment Valid?}
    S10 -->|No| S11[422 Invalid Score]
    S10 -->|Yes| S12{Anomaly Detected?}
    S12 -->|Yes| S13[Flag for Review<br/>Continue with Caution]
    S12 -->|No| S14[Process Request]
    S13 --> S14
    
    style S3 fill:#ffcdd2
    style S5 fill:#ffcdd2
    style S7 fill:#ffcdd2
    style S9 fill:#ffcdd2
    style S11 fill:#ffcdd2
    style S13 fill:#fff3cd
    style S14 fill:#d4edda
```

## 7. Database Transaction Flow for Score Update

```mermaid
sequenceDiagram
    participant API as API Server
    participant PG as PostgreSQL
    participant R as Redis
    
    API->>PG: BEGIN TRANSACTION
    
    PG->>PG: SELECT current_score FROM users<br/>WHERE id = $userId FOR UPDATE
    
    PG->>PG: UPDATE users SET<br/>current_score = current_score + $increment<br/>WHERE id = $userId
    
    PG->>PG: INSERT INTO score_history<br/>(user_id, action_id, score_change, new_score)<br/>VALUES (...)
    
    PG->>PG: UPDATE action_tokens<br/>SET used = true<br/>WHERE token = $token
    
    alt Transaction Success
        PG-->>API: COMMIT
        API->>R: DEL user:score:$userId
        API->>R: DEL scoreboard:top10
    else Transaction Failed
        PG-->>API: ROLLBACK
        API-->>API: Log Error
    end
```

## 8. Monitoring and Alerting Flow

```mermaid
graph TB
    subgraph "Metrics Collection"
        M1[API Metrics] --> P[Prometheus]
        M2[Database Metrics] --> P
        M3[Redis Metrics] --> P
        M4[System Metrics] --> P
    end
    
    subgraph "Log Aggregation"
        L1[Application Logs] --> E[Elasticsearch]
        L2[Security Logs] --> E
        L3[Error Logs] --> E
    end
    
    subgraph "Alerting"
        P --> G[Grafana]
        E --> K[Kibana]
        P --> A[AlertManager]
        A --> S1[Slack]
        A --> S2[PagerDuty]
        A --> S3[Email]
    end
    
    subgraph "Alert Conditions"
        AC1[High Error Rate > 5%]
        AC2[Response Time > 500ms]
        AC3[Anomaly Score Pattern]
        AC4[Database Connection Pool > 80%]
        AC5[Redis Memory > 90%]
    end
    
    AC1 --> A
    AC2 --> A
    AC3 --> A
    AC4 --> A
    AC5 --> A
```