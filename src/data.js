// All portfolio content lives here. Edit this file to update the site.

export const profile = {
  name: 'Shashidher Mylarapu',
  first: 'Shashidher',
  last: 'Mylarapu',
  role: 'AI/ML Engineer',
  location: 'Manchester, NH',
  city: 'Manchester, New Hampshire',
  country: 'USA',
  timezone: 'America/New_York',
  phone: '+1 (603) 682-6305',
  phoneHref: 'tel:+16036826305',
  email: 'shashidher.mylarapu@applywizard.ai',
  linkedin: 'https://www.linkedin.com/in/shashidher-mylarapu-526621202/',
  github: 'https://github.com/shashidher-210',
  resume: '/Shashidher_Mylarapu_Resume.pdf',
  photo: '/shashidher.jpg',
}

export const nav = [
  { id: 'about', label: 'About me' },
  { id: 'works', label: 'Works' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'contact', label: 'Connect' },
]

// Preloader ring
export const ringWords = ['DATA', 'DECISIONS', 'MACHINE LEARNING', 'GENERATIVE AI', 'MLOPS', 'DEPLOYMENT', 'RAG', 'AGENTS']

export const heroRoles = ['Machine learning', 'Generative AI (RAG)', 'MLOps & deployment']

// Manifesto lines — `dim` lines render grey
export const manifesto = [
  { text: 'MACHINE LEARNING' },
  { text: 'IS NOT JUST', dim: true },
  { text: 'ACCURACY, BUT', dim: true },
  { text: 'A SYSTEM THAT MOVES' },
  { text: 'REAL DECISIONS.' },
]

// Works shown on the screen inside the 3D room
export const works = [
  {
    id: 'defect',
    title: 'Manufacturing Defect Prediction',
    org: 'Ford Motor Company',
    category: 'Manufacturing AI',
    year: '2026',
    metric: '+8%',
    metricLabel: 'Classification F1',
    accent: '#8c1d2f',
    graphic: 'grid',
    summary: 'Predicting production quality risks early enough for quality engineers to act before recurring defects reach operations.',
    bullets: [
      'Engineered defect prediction models with Python, XGBoost, Scikit-learn and feature engineering, improving F1 by 8%.',
      'Built LightGBM production-risk forecasting with cross-validation to surface abnormal manufacturing patterns.',
      'Investigated degradation with SHAP, data drift and model drift analysis alongside manufacturing engineering and QA.',
    ],
    stack: ['Python', 'XGBoost', 'LightGBM', 'Scikit-learn', 'SHAP'],
    run: { cmd: 'python train.py --task defect --cv 5', steps: ['load production quality records', 'engineer features  pandas · sklearn', 'tune xgboost + lightgbm  cross-val'], result: ['f1  +8% vs previous model', 'explain  shap · drift checks', 'register  mlflow → staging'] },
  },
  {
    id: 'rag',
    title: 'Engineering Knowledge RAG',
    org: 'Ford Motor Company',
    category: 'Generative AI',
    year: '2026',
    metric: '24%',
    metricLabel: 'Faster document retrieval',
    accent: '#1e4e6b',
    graphic: 'docs',
    summary: 'Retrieval-augmented generation and agentic workflows that let engineers find the right technical document faster.',
    bullets: [
      'Applied RAG with Amazon Bedrock, LangChain, embeddings and vector databases, cutting retrieval time 24% in pilots.',
      'Orchestrated LangGraph agents with tool calling and structured outputs to automate knowledge requests.',
      'Served through AWS SageMaker, Docker and FastAPI at 99.5% availability, with 19% lower latency.',
    ],
    stack: ['Amazon Bedrock', 'LangChain', 'LangGraph', 'SageMaker', 'FastAPI'],
    run: { cmd: 'python ingest.py --docs eng --embed bedrock', steps: ['chunk + embed engineering documents', 'index vector store', 'langgraph agent  tool calling'], result: ['retrieval time  −24% in pilots', 'serve  fastapi · sagemaker', 'availability  99.5%'] },
  },
  {
    id: 'docs',
    title: 'Enterprise Document Intelligence',
    org: 'Augur Talentcare',
    category: 'Deep Learning & NLP',
    year: '2021–24',
    metric: '0.89',
    metricLabel: 'Macro F1 across categories',
    accent: '#6b4e16',
    graphic: 'bars',
    summary: 'Transformer-based document classification serving 18,000 predictions a day to enterprise applications.',
    bullets: [
      'Architected classification workflows with PyTorch and Hugging Face Transformers, reaching 0.89 macro F1.',
      'Built TensorFlow transfer-learning pipelines that reduced manual categorization effort by 32%.',
      'Automated validation and release with GitHub Actions, Pytest and Model Registry, cutting release prep by 38%.',
    ],
    stack: ['PyTorch', 'Transformers', 'TensorFlow', 'FastAPI', 'MLflow'],
    run: { cmd: 'python train.py --model transformer --task docs', steps: ['tokenize  hugging face', 'fine-tune  pytorch transfer learning', 'validate  pytest · github actions'], result: ['macro f1  0.89', 'manual categorization  −32%', 'serving  18,000 predictions/day'] },
  },
  {
    id: 'agentic',
    title: 'Agentic RAG Knowledge Assistant',
    org: 'Project',
    category: 'Agentic AI',
    year: '2025',
    metric: '89%',
    metricLabel: 'Grounded-answer accuracy target',
    accent: '#2c5a3a',
    graphic: 'nodes',
    summary: 'An enterprise assistant that answers from internal knowledge, with evaluation and guardrails before it is exposed.',
    bullets: [
      'Amazon Bedrock, LangChain, RAG and FAISS over internal knowledge documents.',
      'Multi-step LangGraph retrieval with prompt engineering and tool calling across 6 request scenarios.',
      'LLM evaluation, hallucination detection and guardrails, targeting 22% fewer unsupported answers.',
    ],
    stack: ['Bedrock', 'LangGraph', 'FAISS', 'FastAPI'],
    run: { cmd: 'python eval.py --suite grounded-qa --scenarios 6', steps: ['retrieve  faiss · hybrid search', 'reason  langgraph multi-step', 'guard  hallucination checks'], result: ['target grounded accuracy  89%', 'target unsupported answers  −22%', 'serve  fastapi endpoint'] },
  },
  {
    id: 'vision',
    title: 'Visual Defect Detection',
    org: 'Project',
    category: 'Computer Vision',
    year: '2025',
    metric: '0.92',
    metricLabel: 'F1 score target',
    accent: '#4a2a6b',
    graphic: 'scan',
    summary: 'A transfer-learning image classifier that separates manufacturing surface defects from acceptable parts.',
    bullets: [
      'PyTorch transfer learning trained across 14,000 labeled images.',
      'TensorFlow hyperparameter tuning and cross-validation for varied inspection conditions.',
      'SageMaker and MLflow experiments, aiming for 26% less manual review through confidence-based routing.',
    ],
    stack: ['PyTorch', 'TensorFlow', 'SageMaker', 'MLflow'],
    run: { cmd: 'python train.py --task vision --images 14000', steps: ['load 14,000 labeled images', 'transfer learning  pytorch', 'tune  tensorflow · cross-val'], result: ['target f1  0.92', 'target manual review  −26%', 'track  sagemaker · mlflow'] },
  },
  {
    id: 'churn',
    title: 'Customer Churn & Retention',
    org: 'Project',
    category: 'Machine Learning',
    year: '2024',
    metric: '0.86',
    metricLabel: 'ROC-AUC target',
    accent: '#7a3416',
    graphic: 'line',
    summary: 'A churn model that turns 72,000 customer records into five actionable retention segments.',
    bullets: [
      'XGBoost and Scikit-learn model identifying subscribers at risk of leaving.',
      'Behavioral features from 72,000 records with SQL, Pandas and NumPy.',
      'Cross-validated risk scores grouped into 5 retention segments for targeted outreach.',
    ],
    stack: ['XGBoost', 'Scikit-learn', 'SQL', 'Pandas'],
    run: { cmd: 'python train.py --task churn --rows 72000', steps: ['query  sql · pandas', 'behavioural features', 'model  xgboost · sklearn'], result: ['target roc-auc  0.86', 'segments  5 retention groups', 'export  risk scores'] },
  },
]

export const about = {
  experience: 'An AI/ML engineer with 4+ years of combined experience building ML, deep learning and generative AI systems for manufacturing and enterprise teams.',
  quote: ['It’s not just a model', '— it’s a way', 'of reasoning.'],
  work: 'My work lives where data meets operations. As an engineer, I am constantly asking the same thing: who will rely on this prediction, and what happens when it is wrong?',
  philosophy: 'I value clarity, evidence and reliability, in models and in teams. I believe in conscious simplicity: start with a baseline, keep only what moves the metric, and ship what can be monitored. I love simple systems with deep impact.',
  approach: 'I look for signal everywhere: in feature distributions, in drift dashboards, in the questions QA engineers ask on the factory floor. It’s not just a job. It’s a way of seeing problems.',
  closing: [
    'Every model for me is more than a notebook. It’s a decision that someone will make faster and with more confidence.',
    'I believe a good ML system is not just about accuracy and F1, but about the trust it earns once it’s in production.',
  ],
}

export const expertise = [
  {
    title: 'Machine Learning',
    items: ['Scikit-learn', 'XGBoost / LightGBM', 'Feature engineering', 'Classification & regression', 'Cross-validation'],
    text: 'Predictive models built for noisy, imbalanced, real-world data, from defect risk on a production line to customer churn.',
  },
  {
    title: 'Deep Learning & NLP',
    items: ['PyTorch', 'TensorFlow', 'Hugging Face Transformers', 'Transfer learning', 'Text classification'],
    text: 'Transformer and CNN pipelines that read documents and images, classify what they see and keep doing it at 18,000 predictions a day.',
  },
  {
    title: 'Generative & Agentic AI',
    items: ['LLMs & RAG', 'LangChain / LangGraph', 'Embeddings & FAISS', 'Hybrid search & reranking', 'Tool calling & structured outputs'],
    text: 'Grounded LLM applications on Amazon Bedrock: retrieval that finds the right answer, agents that act on it and evaluations that catch hallucinations.',
  },
  {
    title: 'MLOps & Cloud',
    items: ['AWS SageMaker & S3', 'MLflow & model registry', 'Docker / Kubernetes', 'GitHub Actions CI/CD', 'FastAPI serving'],
    text: 'Repeatable training, automated promotion and inference services that stay up: 99.5% availability and 21% faster model promotion.',
  },
  {
    title: 'Evaluation & Responsible AI',
    items: ['Precision / recall / F1', 'ROC-AUC', 'SHAP explainability', 'Data & model drift', 'LLM guardrails'],
    text: 'Measuring what matters and explaining why: drift monitoring, SHAP analysis and guardrails that keep models trustworthy after launch.',
  },
]

export const credentials = [
  { name: 'IBM AI Engineering', issuer: 'IBM', mark: 'IBM' },
  { name: 'IBM Machine Learning', issuer: 'IBM', mark: 'IBM' },
  { name: 'IBM Generative AI Engineering', issuer: 'IBM', mark: 'IBM' },
  { name: 'Deep Learning Specialization', issuer: 'DL.AI', mark: 'DL' },
  { name: 'Machine Learning Specialization', issuer: 'DL.AI', mark: 'ML' },
  { name: 'Machine Learning in Production', issuer: 'DL.AI', mark: 'MP' },
]

export const education = [
  { degree: 'M.S. Information Technology', school: 'Southern New Hampshire University', short: 'SNHU', dates: '2025–2026' },
  { degree: 'B.Tech Electronics & Communication', school: 'Jawaharlal Nehru Technological University', short: 'JNTU', dates: '2019–2023' },
]

export const roleTypes = ['Full-time', 'Contract', 'Consulting']
