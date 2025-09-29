# MetaCat - A _DataCite_ **Metadata Catalog** REST backend service

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) 
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/) 
![Static Badge](https://img.shields.io/badge/language-javascript-yellow)
![Static Badge](https://img.shields.io/badge/runtime-Node.js-green) 

**MetaCat** is a specialized, cloud-native backend service designed to create and manage a catalog of metadata for **scientific products**. It exposes a **_pragmatic_** **REST-like API** for the entire lifecycle of research metadata—from creation to publication—strictly following the **[DataCite Metadata Kernel v4.6](https://schema.datacite.org/meta/kernel-4.6/)**. Each metadata record is linked to a scientific product (such as a dataset, software, or publication) via a Digital Object Identifier (DOI).

This project originated as a research and development case study. It is provided to the community under the **AGPL-3.0 License** as both a research product and a foundation for new implementations, offered "AS IS", without any warranty.

The backend is built with Node.js, Express, and MongoDB, featuring a complete JWT and OAuth2 (ORCID) authentication and role-based authorization system, ready for containerized deployment with Docker.

---

## ✨ Features

* **DataCite Schema v4.6**: Full CRUD support for records compliant with the latest DataCite standard.
* **Hybrid Authentication**:
    * Local user registration (`username`/`password`).
    * **OAuth2** integration with **ORCID** (Sandbox & Production).
    * Secure session management using **JSON Web Tokens (JWT)**.
* **Role-Based Authorization (RBAC)**:
    * Pre-defined roles (`user`, `curator`, `admin`) with granular permissions.
    * Record ownership rules and a full publication workflow (`draft` -> `published`).
* **Advanced Querying**:
    * Full-text search across indexed metadata fields.
    * Advanced filtering on record properties (e.g., publication status, owner).
* **Professional Architecture**:
    * Clean, layered architecture (Routes, Controllers, Services, DAO/Repository, Models).
    * Robust, centralized error handling with custom error classes.
    * Modern asynchronous code with `async/await` and reusable wrappers.
    * Strong input validation with **AJV** and a full suite of JSON Schemas.
* **DevOps & Tooling**:
    * Full **Docker & Docker Compose** setup for the entire stack (Backend, MongoDB, Nginx Proxy).
    * Automated database migrations with **Umzug**.
    * Interactive API documentation via **Swagger/OpenAPI 3.0**.
    * Comprehensive testing suite using **Mocha & Chai** (functional, integration, and unit tests).

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose
* **Authentication**: JWT, OAuth2, bcrypt
* **Validation**: AJV
* **Testing**: Mocha, Chai, Chai-HTTP
* **Migrations**: Umzug
* **DevOps**: Docker, Docker Compose, Nginx

---

## 🚀 Getting Started

Follow these instructions to get a local development environment up and running.

### Prerequisites

* Node.js (v18 or later)
* npm
* Docker & Docker Compose
* `openssl` (for generating local SSL certificates)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project by copying the example file. Then, fill in the required values.
    ```bash
    cp .env.example .env
    # Now edit the .env file with your secrets and configuration
    ```

4.  **Set up Local HTTPS with Nginx:**
    This project uses an Nginx reverse proxy to provide HTTPS for local development (required by ORCID OAuth2).
    
    * **Generate SSL certificate:**
        ```bash
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
          -keyout localhost.key -out localhost.crt \
          -subj "/C=IT/ST=State/L=City/O=Dev/CN=localhost"
        ```
    * **Start the full stack (Nginx, Backend, DB):**
        ```bash
        docker-compose up --build
        ```
    The API will now be available at `https://localhost`.

5.  **Run Database Migrations:**
    Before starting, apply any pending database migrations.
    ```bash
    npm run migrate:up
    ```

### Running the App
* **For development (with hot-reloading via nodemon):**
    ```bash
    npm run dev
    ```
* **For production:**
    ```bash
    npm run start
    ```

---

## 📖 API Documentation

This project uses Swagger/OpenAPI for interactive API documentation. Once the server is running, access it at:
**[https://localhost/api-docs](https://localhost/api-docs)**



You can test all endpoints directly from this interface, including the authenticated ones using the "Authorize" button.

---

## 🧪 Running Tests

The test suite uses Mocha and Chai. The test database is configured separately via your `.env` file for the `test` environment.

* **Run all tests:**
    ```bash
    npm test
    ```
* **Run specific test suites:**
    ```bash
    # Run only authentication tests
    npm run test:auth

    # Run only migration tests
    npm run test:migration
    ```

---

## 📄 License & ⚖️ Disclaimer

This project is licensed under the **GNU Affero General Public License v3.0**. The full license text can be found in the [LICENSE](LICENSE) file.

The primary goal of this project is to serve as a research and study tool. It is provided **"AS IS", without warranty of any kind**, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
