# Hotel Offer Orchestrator

A backend service built with Node.js, TypeScript, Express, Temporal, Redis, PostgreSQL, and Docker Compose.

The service aggregates hotel offers from two mock suppliers, removes duplicate hotels, selects the cheapest offer for each hotel, and supports price-range filtering using Redis.

## Features

- Mock Supplier A hotel API
- Mock Supplier B hotel API
- Parallel supplier calls using Temporal
- Hotel deduplication by hotel name
- Cheapest offer selected when the same hotel exists in both suppliers
- Single-supplier hotels are retained
- Deduplicated offers stored in Redis
- Price filtering performed inside Redis
- REST API using Express
- Dockerized application
- Temporal worker and server
- PostgreSQL for Temporal persistence
- Redis for hotel offer storage

## Tech Stack

- Node.js
- TypeScript
- Express
- Temporal.io
- Redis
- PostgreSQL
- Docker
- Docker Compose
- ioredis

## Architecture

```text
                         Client / Postman
                                |
                                v
                         Express API
                                |
                                v
                       Temporal Client
                                |
                                v
                     Temporal Workflow
                       /            \
                      /              \
                     v                v
             Supplier A Activity   Supplier B Activity
                     \                /
                      \              /
                       v            v
                         All Offers
                              |
                              v
                       Deduplication
                              |
                              v
                       Cheapest Offer
                              |
                              v
                     Redis Activity
                              |
                              v
                            Redis
```

For price filtering, Redis performs the range query instead of filtering the results in the application layer.

## Project Structure

```text
HOO/
|
├── src/
│   ├── config/
│   │   ├── redis.config.ts
│   │   └── temporal.config.ts
│   │
│   ├── controller/
│   │   ├── health.controller.ts
│   │   ├── hotel.controller.ts
│   │   └── supplier.controller.ts
│   │
│   ├── errors/
│   │   └── AppError.ts
│   │
│   ├── middleware/
│   │   └── error.middleware.ts
│   │
│   ├── redis/
│   │   └── hotels.redis.ts
│   │
│   ├── routes/
│   │   ├── health.routes.ts
│   │   ├── hotel.routes.ts
│   │   └── supplier.routes.ts
│   │
│   ├── services/
│   │   ├── hotels.service.ts
│   │   └── supplier.service.ts
│   │
│   ├── suppliers/
│   │   ├── supplierA.ts
│   │   └── supplierB.ts
│   │
│   ├── temporal/
│   │   ├── activities/
│   │   │   └── hotel.activities.ts
│   │   ├── client.ts
│   │   ├── worker.ts
│   │   └── workflow.ts
│   │
│   ├── types/
│   │   └── hotels.types.ts
│   │
│   └── server.ts
│
├── postman/
│   └── Hotel Offer Orchestrator.postman_collection.json
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── .dockerignore
└── README.md
```

## API Endpoints

### Get Hotels

```http
GET /api/hotels?city=delhi
```

Example:

```text
http://localhost:8000/api/hotels?city=delhi
```

The request is processed through the Temporal workflow.

The workflow:

1. Calls Supplier A and Supplier B in parallel.
2. Combines their results.
3. Deduplicates hotels by name.
4. Selects the cheaper offer when the hotel exists in both suppliers.
5. Keeps hotels that exist in only one supplier.
6. Saves the final deduplicated list to Redis.
7. Returns the result.

### Filter Hotels by Price

```http
GET /api/hotels?city=delhi&minPrice=5000&maxPrice=8500
```

Example:

```text
http://localhost:8000/api/hotels?city=delhi&minPrice=5000&maxPrice=8500
```

Price filtering is performed directly inside Redis using a sorted-set range query.

### Supplier A

```http
GET /supplierA/hotels
```

Example:

```text
http://localhost:8000/supplierA/hotels
```

### Supplier B

```http
GET /supplierB/hotels
```

Example:

```text
http://localhost:8000/supplierB/hotels
```

### Health Check

```http
GET /health
```

Example:

```text
http://localhost:8000/health
```

The health endpoint reports the status of both mock suppliers.

Example response:

```json
{
  "success": true,
  "status": "healthy",
  "suppliers": {
    "supplierA": "healthy",
    "supplierB": "healthy"
  }
}
```

A `503` response is returned when one or more suppliers are unhealthy.

## Example Response

```json
{
  "success": true,
  "data": [
    {
      "hotelId": "b1",
      "name": "Holtin",
      "price": 5340,
      "city": "delhi",
      "commissionPct": 20
    },
    {
      "hotelId": "a2",
      "name": "Radison",
      "price": 5900,
      "city": "delhi",
      "commissionPct": 13
    },
    {
      "hotelId": "b3",
      "name": "Taj Palace",
      "price": 8200,
      "city": "delhi",
      "commissionPct": 18
    },
    {
      "hotelId": "a4",
      "name": "The Oberoi",
      "price": 9000,
      "city": "delhi",
      "commissionPct": 12
    },
    {
      "hotelId": "b4",
      "name": "Leela Palace",
      "price": 9500,
      "city": "delhi",
      "commissionPct": 14
    }
  ]
}
```

## Deduplication Logic

When the same hotel is returned by both suppliers, the offer with the lower price is selected.

Example:

```text
Holtin

Supplier A -> ₹6000
Supplier B -> ₹5340

Selected -> Supplier B
```

Another example:

```text
Radison

Supplier A -> ₹5900
Supplier B -> ₹6200

Selected -> Supplier A
```

Hotels available from only one supplier are retained.

## Redis

Redis stores the deduplicated hotel offers.

The Redis key follows this format:

```text
hotels:<city>
```

Examples:

```text
hotels:delhi
hotels:mumbai
```

Hotel prices are stored as sorted-set scores.

Price filtering uses Redis directly:

```text
ZRANGE hotels:delhi 5000 8500 BYSCORE
```

This allows the application to retrieve only hotels within the requested price range without filtering the complete list in Node.js.

## Temporal Workflow

The Temporal workflow orchestrates the hotel aggregation process.

Supplier calls are executed in parallel:

```typescript
const [supplierAOffers, supplierBOffers] = await Promise.all([
  getSupplierAHotels(city),
  getSupplierBHotels(city),
]);
```

The offers are then combined:

```typescript
const allOffers = [
  ...supplierAOffers,
  ...supplierBOffers,
];
```

The combined list is deduplicated and the final result is saved to Redis through a Temporal Activity.

Redis access is kept outside the workflow and is performed by an Activity.

## Error Handling

The application uses centralized error handling.

Application-specific errors are represented using `AppError`, which contains:

- HTTP status code
- Error code
- Error message

Example error response:

```json
{
  "success": false,
  "code": "CITY_REQUIRED",
  "message": "city is required"
}
```

Invalid price parameters are validated.

Examples:

```text
GET /api/hotels
GET /api/hotels?city=delhi&minPrice=abc
GET /api/hotels?city=delhi&minPrice=9000&maxPrice=5000
```

Unexpected errors are handled by the centralized error middleware and return an HTTP 500 response.

## Docker

The project can be run completely using Docker Compose.

The Compose setup contains:

```text
PostgreSQL
Temporal
Redis
Express App
Temporal Worker
```

### Prerequisites

Install:

- Docker Desktop
- Docker Compose

Node.js is not required to run the application when using Docker.

### Run With Docker

From the project root:

```bash
docker compose up --build
```

To run in detached mode:

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

Expected services:

```text
postgres
temporal
redis
app
worker
```

### Stop Docker Services

```bash
docker compose down
```

To remove containers and volumes:

```bash
docker compose down -v
```

## View Logs

Application:

```bash
docker compose logs -f app
```

Temporal worker:

```bash
docker compose logs -f worker
```

Temporal:

```bash
docker compose logs -f temporal
```

Redis:

```bash
docker compose logs -f redis
```

All services:

```bash
docker compose logs -f
```

## Environment Variables

When running inside Docker:

```text
NODE_ENV=production
PORT=8000
REDIS_URL=redis://redis:6379
TEMPORAL_ADDRESS=temporal:7233
```

The Docker Compose service names are used for communication between containers.

```text
Redis     -> redis:6379
Temporal  -> temporal:7233
```

## Redis Health Check

To check Redis:

```bash
docker compose exec redis redis-cli ping
```

Expected:

```text
PONG
```

## Testing

A Postman collection is included:

```text
postman/Hotel Offer Orchestrator.postman_collection.json
```

The collection contains tests for:

### Health

```text
GET /health
```

### Supplier APIs

```text
GET /supplierA/hotels
GET /supplierB/hotels
```

### Hotel APIs

```text
GET /api/hotels?city=delhi

GET /api/hotels?city=mumbai

GET /api/hotels?city=delhi&minPrice=5000&maxPrice=8500

GET /api/hotels?city=mumbai&minPrice=6000&maxPrice=7600

GET /api/hotels?city=bangalore
```

The Bangalore request verifies the no-results scenario.

### Error Handling

```text
GET /api/hotels
GET /api/hotels?city=delhi&minPrice=abc
GET /api/hotels?city=delhi&minPrice=9000&maxPrice=5000
```

## Example Price Filtering

Request:

```http
GET /api/hotels?city=mumbai&minPrice=6000&maxPrice=7600
```

Expected result:

```json
{
  "success": true,
  "data": [
    {
      "hotelId": "b5",
      "name": "Trident",
      "price": 7200,
      "city": "mumbai",
      "commissionPct": 10
    }
  ]
}
```

## Development

Install dependencies:

```bash
npm install
```

Build TypeScript:

```bash
npm run build
```

Run the application:

```bash
npm start
```

Run the Temporal worker:

```bash
npm run worker
```

For development, use the development script defined in `package.json`.

## Docker Architecture

```text
                    +----------------+
                    |    Client      |
                    |    Postman     |
                    +-------+--------+
                            |
                            v
                    +---------------+
                    | Express App   |
                    |    :8000      |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Temporal      |
                    | Server :7233  |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Temporal      |
                    | Worker        |
                    +-------+-------+
                            |
              +-------------+-------------+
              |                           |
              v                           v
       Supplier Activities          Redis Activity
                                          |
                                          v
                                  +---------------+
                                  | Redis :6379   |
                                  +---------------+

                    Temporal
                       |
                       v
                 PostgreSQL
                    :5432
```

## Submission Checklist

- [x] Source code
- [x] Dockerfile
- [x] Docker Compose
- [x] README.md
- [x] Postman collection
- [x] Supplier A mock endpoint
- [x] Supplier B mock endpoint
- [x] Temporal orchestration
- [x] Hotel deduplication
- [x] Cheapest offer selection
- [x] Redis persistence
- [x] Redis price filtering
- [x] Health endpoint
- [x] Centralized error handling
- [x] AppError
- [x] Logging
