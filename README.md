# Giftora

## Project Overview
Giftora is a comprehensive application designed to help users manage and track their gifts and gifting lists. It provides an intuitive interface for users to add, edit, and delete gift items, as well as maintain gift lists for various occasions.

## Tech Stack
- **Frontend:** React.js, Redux, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Docker, AWS

## Architecture
Giftora follows a microservices architecture, separating the frontend and backend for better scalability and maintainability. The frontend communicates with the backend through RESTful APIs, enabling smooth data interactions.

## API Documentation
- **GET /api/gifts**: Retrieves all gifts.
- **POST /api/gifts**: Adds a new gift.
- **PUT /api/gifts/:id**: Updates an existing gift by ID.
- **DELETE /api/gifts/:id**: Deletes a gift by ID.

## Database Design
The database is structured using MongoDB, with collections for users, gifts, and gift lists. Each gift document includes fields such as `title`, `description`, `price`, `occasion`, and `status`.

## Security Measures
- Implemented JWT for secure user authentication.
- Used HTTPS for secure communications.
- Conducted regular security audits and code reviews to identify and mitigate vulnerabilities.

## Deployment Instructions
1. Clone the repository.
2. Create a `.env` file in the root directory with necessary environment variables.
3. Build the Docker images and containers:
    ```bash
    docker-compose up --build
    ```
4. Access the application at `http://localhost:3000`.

## Testing Guidelines
- Use Jest and React Testing Library for frontend testing.
- Use Mocha and Chai for backend testing.
- Run tests using the following command:
    ```bash
    npm test
    ```

---