# TEAM JAVAST

### Sovereign On-Premise Agentic AI Workbench for Confidential Industrial Knowledge Work

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/License-Unspecified-lightgrey?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Runtime-Ollama-black?style=flat-square" alt="Ollama">
  <img src="https://img.shields.io/badge/Backend-Python-blue?style=flat-square" alt="Python">
</p>

<p align="center">
  <b>Private by Design</b> · <b>Local AI</b> · <b>Multimodal</b> · <b>RAG</b> · <b>Agentic</b> · <b>Tool-Assisted</b>
</p>

An on-premise AI workbench built on open-weight multimodal models, designed to assist confidential industrial and government workflows **without requiring cloud-based AI inference**.

---

## Table of Contents

- [Project Vision](#project-vision)
- [Core Objectives](#core-objectives)
- [System Architecture](#system-architecture)
- [Model Stack](#model-stack)
- [Ollama — Local Model Runtime](#ollama--local-model-runtime)
- [Offline Inference Validation](#offline-inference-validation)
- [Retrieval-Augmented Generation (RAG)](#retrieval-augmented-generation-rag)
- [Multimodal Processing](#multimodal-processing)
- [Agentic Workflow](#agentic-workflow)
- [Tools & Deterministic Calculations](#tools--deterministic-calculations)
- [Verification Layer](#verification-layer)
- [Model Evaluation](#model-evaluation)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Development Workflow](#development-workflow)
- [Local Development Strategy](#local-development-strategy)
- [Local Model Setup](#local-model-setup)
- [Security & Privacy](#security--privacy)
- [Current Project Status](#current-project-status)
- [Final Vision](#final-vision)

---

## Project Vision

Refineries, PSUs, defence-linked manufacturing units, and government organizations generate large volumes of sensitive knowledge and operational data, including:

- Standard Operating Procedures (SOPs)
- Maintenance reports
- Safety manuals
- Incident reports
- Equipment records
- Technical manuals
- Engineering diagrams
- Images and charts
- Scanned documents

Sending such information to external cloud-based AI services can introduce concerns around:

- Data confidentiality
- Data sovereignty
- Intellectual property
- Regulatory compliance
- Network isolation
- Dependence on external AI providers

### Our Goal

TEAM JAVAST aims to build a **sovereign, local-first AI workbench** that enables organizations to perform AI-assisted knowledge work while keeping sensitive information within their controlled infrastructure.

---

## Core Objectives

| Objective | Description |
|---|---|
| **Local AI** | Run open-weight AI models locally using Ollama |
| **Reasoning** | Perform text-based reasoning and knowledge work |
| **Multimodal AI** | Understand images, diagrams, and visual documents |
| **RAG** | Retrieve relevant information from internal documents |
| **Agentic Workflows** | Enable multi-step AI workflows and tool selection |
| **Tool Usage** | Perform deterministic calculations using software tools |
| **Verification** | Validate generated responses against available evidence |
| **Offline Capability** | Perform AI inference without requiring internet connectivity |
| **Data Sovereignty** | Keep sensitive organizational information within controlled infrastructure |

---

## System Architecture

```text
                              USER
                                │
                                ▼
                     ┌─────────────────────┐
                     │    AI WORKBENCH     │
                     │  Chat / Upload UI   │
                     └──────────┬──────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │  QUERY / UPLOAD   │
                      └─────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
            TEXT             IMAGE            DOCUMENT
              │                 │                 │
              ▼                 ▼                 ▼
         ┌─────────┐      ┌────────────┐    ┌──────────────┐
         │ Qwen3   │      │ Qwen3-VL   │    │   Document   │
         │   4B    │      │    4B      │    │   Ingestion  │
         └────┬────┘      └─────┬──────┘    └──────┬───────┘
              │                 │                  │
              │                 │                  ▼
              │                 │              Chunking
              │                 │                  │
              │                 │                  ▼
              │                 │         ┌─────────────────┐
              │                 │         │ Qwen3-Embedding │
              │                 │         │       4B        │
              │                 │         └────────┬────────┘
              │                 │                  │
              │                 │                  ▼
              │                 │             Vector DB
              │                 │                  │
              └─────────────────┼──────────────────┘
                                │
                                ▼
                          RAG RETRIEVAL
                                │
                                ▼
                          AGENT LAYER
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
             Retrieval      Calculator        Tools
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                                ▼
                          VERIFICATION
                                │
                                ▼
                       EVIDENCE-BACKED
                           RESPONSE
                                │
                                ▼
                              USER
```

---

## Model Stack

The initial system uses three complementary open-weight models, each with a distinct responsibility.

| Model | Primary Role | Current Status |
|---|---|---|
| **Qwen3 4B** | Text reasoning and generation | ✅ Downloaded & Tested |
| **Qwen3-VL 4B** | Vision and multimodal understanding | 🔄 Setup in Progress |
| **Qwen3-Embedding 4B** | Embeddings and semantic retrieval | 🔄 Setup in Progress |

### Qwen3 4B — Main Reasoning Model

Primary text reasoning and generation model.

**Intended responsibilities:**
- Question answering
- Summarization
- Technical reasoning
- Information extraction
- Report generation
- Procedure generation
- Interpretation of retrieved information
- Reasoning within agentic workflows

```text
USER QUESTION → Qwen3 4B → GENERATED ANSWER
```

**Current status:**
- ✅ Downloaded
- ✅ Running through Ollama
- ✅ Tested on representative cases
- ✅ Successfully tested with internet disconnected

### Qwen3-VL 4B — Vision & Multimodal AI

*VL = Vision-Language.* Processes visual information.

**Target inputs:**
- Equipment photographs
- P&ID diagrams
- Charts and graphs
- Scanned documents
- Screenshots
- Technical diagrams
- Tables contained in images

```text
IMAGE / DIAGRAM → Qwen3-VL 4B → VISUAL UNDERSTANDING → AI WORKFLOW
```

### Qwen3-Embedding 4B — Semantic Retrieval

Not the primary conversational model — its role is to convert documents and queries into numerical representations for semantic search, forming the retrieval foundation of the planned RAG system.

```text
DOCUMENT → Qwen3-Embedding 4B → VECTOR → VECTOR DB
```

---

## Ollama — Local Model Runtime

Ollama is used as the local runtime for the open-weight models. It is **not** another AI model — it provides the local environment through which the models are executed and stored.

```text
                         LOCAL MACHINE
                              │
                            Ollama
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
          Qwen3 4B       Qwen3-VL 4B     Embedding 4B
```

---

## Offline Inference Validation

A key initial validation is the ability to perform model inference without an active internet connection.

```text
INTERNET (disabled) → Ollama → Qwen3 4B → RESPONSE → ✅ WORKS
```

**Result:** Qwen3 4B successfully generated responses after internet connectivity was disabled — initial evidence that inference can be performed locally rather than requiring a cloud AI API.

> **Note:** Offline inference alone does not guarantee complete enterprise security. A production deployment would additionally require authentication, authorization, network security, secure storage, encryption, auditing, and other security controls.

---

## Retrieval-Augmented Generation (RAG)

RAG will allow the system to answer questions using information retrieved from internal organizational documents, rather than relying only on pretrained model knowledge.

### Planned Pipeline

```text
INTERNAL DOCUMENTS
        │
        ▼
DOCUMENT INGESTION → CHUNKING → QWEN3-EMBEDDING → VECTOR DATABASE
                                                          │
USER QUESTION → QUERY EMBEDDING ────────────────► SEMANTIC SEARCH
                                                          │
                                                          ▼
                                                 RELEVANT CHUNKS
                                                          │
                                                          ▼
                                                      QWEN3 4B
                                                          │
                                                          ▼
                                                 GROUNDED ANSWER
```

**Expected benefits:** improved relevance, better use of organizational knowledge, evidence-based responses, improved traceability, reduced hallucination risk.

---

## Multimodal Processing

The workbench is designed to support both textual and visual information.

**Planned input types:** PDF · DOCX · TXT · Images · Scanned Documents · Charts · Diagrams · Equipment Photographs

Text-based information is handled by Qwen3 4B, while visual information is processed using Qwen3-VL 4B.

---

## Agentic Workflow

The agentic layer determines which actions or information sources are required for a task.

```text
USER → AGENT ──┬─→ Retrieve Document
               ├─→ Perform Calculation
               ├─→ Use Tool
               └─→ Verify Result → FINAL RESPONSE
```

The initial implementation uses **Qwen3 4B as the reasoning model behind the agentic workflow** — a separate agent-specific LLM is not required for the prototype.

---

## Tools & Deterministic Calculations

Tasks requiring exact calculations are handled using deterministic software tools rather than relying entirely on LLM-generated arithmetic.

**Examples:** arithmetic, unit conversion, threshold checking, statistical calculations, engineering formulas, data processing.

```text
INPUT VALUES → PYTHON TOOL → VERIFIED CALCULATION → QWEN3 → EXPLANATION
```

---

## Verification Layer

Checks whether generated responses are supported by available information.

**Planned checks:**
- Evidence availability
- Source consistency
- Calculation correctness
- Operating-range validation
- Unsupported claims
- Retrieval quality

The initial implementation combines deterministic checks, retrieved evidence, and model-based validation where appropriate.

---

## Model Evaluation

The team is evaluating the initial model setup using **12 representative industrial/workflow test cases**.

### Test Categories

1. Document Question Answering
2. Summarization
3. Information Extraction
4. Classification
5. Technical Reasoning
6. Procedure Generation
7. Document Comparison
8. Structured Output
9. Long-Document Retrieval
10. Safety / Hazard Analysis
11. Multilingual Processing
12. Unknown / Unsupported Information

### Evaluation Metrics

| Metric | Description |
|---|---|
| Accuracy | Correctness of the response |
| Relevance | Whether the response addresses the task |
| Grounding | Whether claims are supported by provided information |
| Hallucination | Unsupported or fabricated information |
| Latency | Response time |
| Robustness | Performance across input variations |
| Failure Mode | Reason for incorrect or weak output |

Both successful and failed cases are recorded.

---

## Technology Stack

| Layer | Components |
|---|---|
| **AI Models** | Qwen3 4B · Qwen3-VL 4B · Qwen3-Embedding 4B |
| **Local Runtime** | Ollama |
| **Backend** | Python, local model integration |
| **Retrieval** | Embedding model, vector database, RAG pipeline |
| **Development** | Git, GitHub, Claude Code |
| **Frontend** | Web-based AI workbench |

---

## Repository Structure

```text
TEAM-JAVAST/
│
├── backend/
├── frontend/
├── rag/
├── agents/
├── tools/
├── tests/
│
├── requirements.txt
├── README.md
└── .gitignore
```

> The exact structure may evolve as implementation progresses.

---

## Development Workflow

GitHub is the shared source of truth for project code.

```text
DEVELOPER → MODIFY CODE → git add → git commit → git push → GITHUB → git pull → TEAMMATES
```

**Important:** Model weights are **not** stored in GitHub. GitHub stores source code, configuration, documentation, tests, dependencies, and setup instructions. Ollama manages the locally downloaded model files.

---

## Local Development Strategy

During the prototype stage, the team has access to a gaming laptop suitable for running the local AI models.

```text
TEAM MEMBERS → Write Code → GitHub → GAMING LAPTOP → Ollama
                                                          │
                                          ┌───────────────┼───────────────┐
                                          ▼               ▼               ▼
                                        Qwen3          Qwen-VL         Embedding
                                          │               │               │
                                          └───────────────┼───────────────┘
                                                          ▼
                                                     AI TESTING
```

Developers who need to directly run AI inference can install Ollama and the required models on their own machines.

---

## Local Model Setup

**1. Install Ollama**

Install Ollama on the machine that will run the local AI models.

**2. Download the required models**

```bash
ollama pull qwen3:4b
ollama pull qwen3-vl:4b
ollama pull qwen3-embedding:4b
```

**3. Verify installation**

```bash
ollama list
```

Expected output:

```text
NAME
qwen3:4b
qwen3-vl:4b
qwen3-embedding:4b
```

---

## Security & Privacy

The project follows a **local-first architecture** intended to keep sensitive information within the organization's controlled environment.

A production deployment would additionally require:

- Authentication
- Authorization
- Access control
- Encryption
- Secure storage
- Network isolation
- Audit logging
- Data retention policies
- Model integrity verification
- Secure deployment practices

---

## Current Project Status

**✅ Completed**
```text
Ollama → Qwen3 4B → Local Inference → Internet Disconnected → Still Works ✅
```

**🔄 In Progress**
```text
Qwen3 4B / Qwen3-VL 4B / Qwen3-Embedding 4B → 12-Case Evaluation
```

**🎯 Next Milestone**
```text
Python → Ollama → Local Qwen Models → Document Ingestion → Embeddings → RAG
```

---

## Final Vision

TEAM JAVAST aims to demonstrate that useful industrial knowledge work can be performed using an:

> **Open-weight · Local · Multimodal · Agentic · Evidence-grounded AI system**

— while keeping sensitive organizational information within the organization's controlled infrastructure.

---

<p align="center">
  <b>TEAM JAVAST</b><br>
  <i>Sovereign AI for Confidential Industrial Knowledge Work</i><br><br>
  Local-first · Open-weight · Multimodal · Evidence-grounded · Agentic
</p>
