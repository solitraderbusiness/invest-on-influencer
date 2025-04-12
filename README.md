# Instagram Influencer Investment Analysis Platform

A comprehensive platform for analyzing Iranian Instagram influencers for venture capital investment opportunities.

## Project Overview

This platform provides tools to analyze Instagram influencers based on VC-focused metrics, track their performance over time, and identify potential investment opportunities. The system includes:

1. **Data Collection Engine**: Automated scraper using Playwright/Selenium with proxy rotation to collect Instagram data
2. **Scoring Engine**: Proprietary algorithm to evaluate influencers based on VC-focused metrics
3. **Historical Monitoring**: Time-series database to track influencer growth and performance
4. **Analytics Dashboard**: Interactive UI to visualize data and insights

## Project Structure

```
├── backend/               # FastAPI backend application
│   ├── app/              # Application code
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── db/           # Database models and connections
│   │   ├── scrapers/     # Instagram data collection modules
│   │   └── scoring/      # Influencer scoring algorithms
│   ├── tests/            # Backend tests
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service connections
│   │   └── utils/        # Utility functions
│   ├── package.json      # Node.js dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── docker/               # Docker configuration
│   ├── docker-compose.yml # Service definitions
│   ├── backend.Dockerfile # Backend container definition
│   └── frontend.Dockerfile # Frontend container definition
└── README.md             # Project documentation
```

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React with Tailwind CSS
- **Database**: PostgreSQL for time-series data
- **Scraping**: Playwright/Selenium with proxy rotation
- **Deployment**: Docker containers

## Getting Started

Instructions for setting up and running the project will be added as development progresses.