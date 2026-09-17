export const config = {
    developer: {
        name: "Adrián",
        fullName: "Adrián Alemany",
        title: "Programmer | IA & Data Engineer | Google Cloud Solutions",
        description: "Data Scientist & AI Engineer with technical training in Google Cloud, Data Engineering, and Generative Artificial Intelligence. Hands-on experience in developing End-to-End architectures: from data ingestion and pipelines (dbt, Terraform, GCP) to the deployment of predictive models and RAG agents."
    },
    social: {
        github: "4lemany",
        email: "adrianalemany40@gmail.com",
        phone: "+34 644 87 11 25",
        location: "Valencia, Spain"
    },
    about: {
        title: "About Me",
        description: "Data Scientist & AI Engineer with technical training in Google Cloud, Data Engineering, and Generative Artificial Intelligence. Hands-on experience in developing End-to-End architectures: from data ingestion and pipelines (dbt, Terraform, GCP) to the deployment of predictive models and RAG agents. Passionate about technical innovation and continuous upskilling within the Open Source ecosystem."
    },
    experiences: [
        {
            position: "Master de IA, DATA & Google Cloud",
            company: "EDEM Escuela de Empresarios",
            period: "2025 - Present",
            location: "Valencia, Spain",
            description: "Advanced specialization in Artificial Intelligence, Cloud Data Engineering, Big Data processing (GCP, BigQuery, Dataflow), and autonomous agent systems.",
            responsibilities: [
                "Architecting scalable streaming and batch pipelines on Google Cloud Platform",
                "Training, evaluating and deploying Machine Learning & Deep Learning models",
                "Building RAG systems and autonomous multi-agent workflows with LangChain & LangGraph",
                "Implementing Infrastructure as Code (Terraform) and MLOps practices"
            ],
            technologies: ["GCP", "Vertex AI", "BigQuery", "Dataflow", "Python", "dbt", "Terraform", "Docker"]
        },
        {
            position: "Professional Machine Learning Engineer Cloud",
            company: "Google Cloud Certified",
            period: "2025",
            location: "Valencia, Spain",
            description: "Official Google Cloud certification validating expertise in designing, building, and productionizing ML models and data pipelines using Google Cloud technologies.",
            responsibilities: [
                "Architecting end-to-end ML solutions on Vertex AI and BigQuery ML",
                "Designing scalable data ingestion pipelines with Pub/Sub and Dataflow",
                "Implementing model governance, tracking, and continuous monitoring"
            ],
            technologies: ["Google Cloud Platform", "Vertex AI", "BigQuery", "Pub/Sub", "MLOps"]
        },
        {
            position: "AI-300: ML Operations Engineer Associate",
            company: "Microsoft Azure Certified",
            period: "2024",
            location: "Valencia, Spain",
            description: "Certification covering operationalization of machine learning workflows, model management, CI/CD integration, and cloud-native MLOps architecture.",
            responsibilities: [
                "Implementing automated ML pipelines and containerized inference",
                "Monitoring model drift, data lineage, and operational metrics",
                "Managing cloud resources and deployment security"
            ],
            technologies: ["Azure ML", "MLOps", "Docker", "CI/CD", "Python"]
        },
        {
            position: "Bootcamp de creación de páginas web",
            company: "EDEM Escuela de Empresarios",
            period: "2024",
            location: "Valencia, Spain",
            description: "Intensive training in modern web engineering, full-stack application development, and responsive user experience design.",
            responsibilities: [
                "Developing interactive and typed user interfaces with React and TypeScript",
                "Building backend microservices and RESTful APIs",
                "Integrating modern frontend design patterns and client-side routing"
            ],
            technologies: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Git"]
        }
    ],
    projects: [
        {
            id: 1,
            title: "Maritime Fuel Consumption Predictive System",
            category: "Data Engineering & ML (Baleària Case Study)",
            technologies: "Python, GCP (Pub/Sub, Dataflow, BigQuery, Vertex AI), DBT, Terraform, CI/CD (GitHub Actions)",
            image: "/images/balearia_fuel.jpg",
            description: "Designed an end-to-end streaming and batch data pipeline utilizing Pub/Sub, Dataflow, and analytical transformations with DBT and BigQuery. Trained and deployed Machine Learning models on Vertex AI Endpoints to predict optimal fuel consumption per maritime route. Implemented IaC via Terraform, CI/CD pipelines in GitHub Actions, and an interactive telemetry dashboard.",
            link: "https://github.com/4lemany"
        },
        {
            id: 2,
            title: "Intelligent Job Platform with Autonomous Agents",
            category: "Autonomous Multi-Agent & Full-Stack",
            technologies: "Python, Google ADK, MCP, React, TypeScript, Gemini API, Speech-to-Text, FastAPI, App Engine",
            image: "/images/job_platform_agents.jpg",
            description: "Built a multi-agent backend architecture (sequential and parallel) with LangChain for automated profile and job offer analysis, filtering, and matching. Integrated Model Context Protocols (MCPs) into the orchestrator agent to utilize Speech-to-Text and Gemini API for real-time interactive voice interviews with an LLM. Developed a reactive React + TypeScript frontend.",
            link: "https://github.com/4lemany"
        },
        {
            id: 3,
            title: "CivicPulse AI — Autonomous Governance Platform",
            category: "Multi-Agent AI & Distributed Systems",
            technologies: "Python, FastAPI, LangGraph, PostgreSQL, Docker, GCP (Cloud Run), ChromaDB, Streamlit",
            image: "/images/civicpulse_ai.jpg",
            description: "Designed and implemented an autonomous, distributed multi-agent system capable of simulating decision-making based on real-time data streams and algorithmic governance. Orchestrated asynchronous communication and consensus resolution among specialized agents using LangGraph and ChromaDB (RAG for regulations). Deployed containerized architecture with Docker on GCP Cloud Run.",
            link: "https://github.com/4lemany"
        },
        {
            id: 4,
            title: "Tourist Occupancy Predictive Engine",
            category: "Machine Learning & Cloud Pipelines",
            technologies: "Python, XGBoost, Vertex AI, REST API, DBT, Terraform",
            image: "/images/tourist_occupancy.jpg",
            description: "Developed a predictive model using XGBoost to estimate occupancy rates, ingesting and cross-referencing weather and real estate market data via external APIs. Orchestrated modular data preprocessing with DBT and provisioned infrastructure on Google Cloud with Terraform. Deployed model for online inference on a managed Vertex AI endpoint.",
            link: "https://github.com/4lemany"
        },
        {
            id: 5,
            title: "Intelligent Price Comparator with RAG & OCR",
            category: "RAG, Document AI & Web Scraping (Hackathon)",
            technologies: "Python, Crawl4AI, Scrapy, Document AI (OCR), LangChain, Vector DB, FastAPI, Streamlit",
            image: "/images/price_comparator_rag.jpg",
            description: "Built an automated extraction and resilient scraping pipeline using Crawl4AI and Scrapy, processing catalogs and brochures via Google Document AI (OCR). Implemented a natural language querying system with Retrieval-Augmented Generation (RAG) to compare prices and suggest optimal purchasing options. Created an MVP in record time.",
            link: "https://github.com/4lemany"
        },
        {
            id: 6,
            title: "Kaggle Predictive Machine Learning Challenge",
            category: "Competitive Data Science & Deep Learning",
            technologies: "Python, Scikit-Learn, PyTorch, TensorFlow, PCA, MICE, Cross-Validation",
            image: "/images/kaggle_ml_experiment.jpg",
            description: "Performed exploratory data analysis (EDA), advanced feature engineering (encoding, normalization, PCA, MICE), and comparative experimentation between traditional models (Scikit-Learn) and Deep Learning architectures (PyTorch / TensorFlow). Optimized hyperparameters achieving up to 96% accuracy with rigorous cross-validation (ROC AUC, PR AUC).",
            link: "https://github.com/4lemany"
        }
    ],
    contact: {
        email: "adrianalemany40@gmail.com",
        github: "https://github.com/4lemany",
        linkedin: "https://www.linkedin.com/in/adri%C3%A1n-alemany-97202a227/",
        twitter: "https://github.com/4lemany",
        facebook: "https://github.com/4lemany",
        instagram: "https://github.com/4lemany"
    },
    skills: {
        develop: {
            title: "IA & DATA ENGINEER",
            description: "End-to-End architectures, ML models & Agentic AI",
            details: "Developing robust data pipelines (dbt, Dataflow, BigQuery) and predictive Machine Learning models on Google Cloud Vertex AI. Designing autonomous multi-agent systems and RAG pipelines using LangChain, LangGraph, and modern LLM APIs.",
            tools: ["Python", "SQL", "Google Cloud (Vertex AI, BigQuery, Dataflow, Pub/Sub)", "LangChain", "LangGraph", "RAG", "LLMs", "Scikit-Learn", "XGBoost", "PyTorch", "TensorFlow", "MLOps (MLflow, Grafana)", "dbt", "Terraform", "Docker", "Apache Beam", "Kafka"]
        },
        design: {
            title: "SOFTWARE & CLOUD SOLUTIONS",
            description: "Modern web interfaces, APIs & cloud deployments",
            details: "Building reactive and typed interfaces in React and TypeScript connected to low-latency backend microservices with FastAPI and Docker. Provisioning cloud infrastructure with Terraform and continuous deployment via GitHub Actions.",
            tools: ["React", "TypeScript", "JavaScript", "FastAPI", "PostgreSQL", "Docker", "GCP Cloud Run", "Terraform", "CI/CD (GitHub Actions)", "Web Scraping (Crawl4AI, Scrapy)", "UV", "REST APIs", "Git"]
        }
    }
};


