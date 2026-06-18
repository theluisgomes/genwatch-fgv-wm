GENERATIONS = [
  {
    "id": "alfa",
    "label": "Gen Alfa",
    "cohort": "2010–hoje",
    "theme": "Pais decidem",
    "color": "#c4b5fd",
    "education_context": "educacao_basica_pais",
    "strategic_questions": [
      "Qual o significado de 'boa escola' por classe social?",
      "Quais ansiedades dos pais sobre o futuro dos filhos?",
      "Como aspiração e realidade financeira se tensionam?"
    ],
    "signal_sources": [
      "youtube",
      "rss",
      "google_trends",
      "dark_social_stub"
    ],
    "capture_signals": {
      "public": [
        "YouTube educativo · buscas dos pais",
        "Fóruns de pais e educadores"
      ],
      "dark_social": [
        "Grupos de pais no WhatsApp"
      ]
    },
    "intelligence_focus": [
      "Ansiedade dos pais sobre o futuro",
      "Significado de 'boa escola' por classe",
      "Aspiração vs. realidade financeira"
    ],
    "delivery_outputs": [
      "Posicionamento para pais de futuros alunos",
      "Campanhas de marca de longo prazo",
      "Conteúdo por ansiedades reais"
    ]
  },
  {
    "id": "z",
    "label": "Gen Z",
    "cohort": "1997–2009",
    "theme": "Vestibular · Faculdade",
    "color": "#3ecfaa",
    "education_context": "vestibular_faculdade",
    "strategic_questions": [
      "Como a Gen Z percebe o valor da faculdade hoje?",
      "Qual a relação com mercado de trabalho e IA?",
      "Onde está a tensão entre ansiedade e aspiração acadêmica?"
    ],
    "signal_sources": [
      "reddit",
      "google_trends",
      "youtube",
      "dark_social_stub"
    ],
    "capture_signals": {
      "public": [
        "TikTok, Instagram, Reddit",
        "Buscas ENEM e vestibular"
      ],
      "dark_social": [
        "Grupos de estudantes no WhatsApp"
      ]
    },
    "intelligence_focus": [
      "Ansiedade vs. aspiração acadêmica",
      "Percepção de valor da faculdade",
      "Relação com mercado e IA"
    ],
    "delivery_outputs": [
      "Estratégia de captação vestibular",
      "Comunicação digital e carreira",
      "Posicionamento frente ao medo de irrelevância"
    ]
  },
  {
    "id": "millennial",
    "label": "Millennials",
    "cohort": "1981–1996",
    "theme": "Pós · MBA · Mestrado",
    "color": "#fcd34d",
    "education_context": "pos_mba_mestrado",
    "strategic_questions": [
      "O MBA ainda é símbolo ou virou commodity?",
      "Quais motivadores reais de requalificação?",
      "Como o ROI percebido varia por perfil e região?"
    ],
    "signal_sources": [
      "reddit",
      "google_trends",
      "rss",
      "dark_social_stub"
    ],
    "capture_signals": {
      "public": [
        "LinkedIn, Twitter/X · NPS FGV",
        "Buscas MBA, mestrado, pós"
      ],
      "dark_social": [
        "Grupos profissionais no WhatsApp"
      ]
    },
    "intelligence_focus": [
      "MBA como símbolo vs. commodity",
      "Motivadores reais de requalificação",
      "ROI percebido por perfil e região"
    ],
    "delivery_outputs": [
      "Estratégia e precificação MBA e pós",
      "Novos formatos educacionais",
      "Comunicação orientada por ROI percebido"
    ]
  },
  {
    "id": "x",
    "label": "Gen X",
    "cohort": "1965–1980",
    "theme": "Ed. executiva",
    "color": "#f9a8d4",
    "education_context": "educacao_executiva",
    "strategic_questions": [
      "Qual a pressão por atualização frente à IA?",
      "Como tempo, custo e urgência entram em conflito?",
      "Qual a relação com prestígio institucional?"
    ],
    "signal_sources": [
      "rss",
      "google_trends",
      "dark_social_stub"
    ],
    "capture_signals": {
      "public": [
        "LinkedIn e fóruns executivos",
        "Buscas requalificação e IA"
      ],
      "dark_social": [
        "Grupos corporativos no WhatsApp"
      ]
    },
    "intelligence_focus": [
      "Pressão por atualização frente à IA",
      "Conflito tempo, custo e urgência",
      "Relação com prestígio institucional"
    ],
    "delivery_outputs": [
      "Educação executiva e corporate learning",
      "Novos formatos ágeis e modulares",
      "Argumento de urgência vs. concorrentes"
    ]
  },
  {
    "id": "boomer",
    "label": "Boomers",
    "cohort": "1946–1964",
    "theme": "Lifelong learning",
    "color": "#fca5a5",
    "education_context": "lifelong_learning",
    "strategic_questions": [
      "Como a educação funciona como identidade pós-carreira?",
      "Qual a disposição para aprendizado contínuo?",
      "Como se vinculam ao prestígio da FGV?"
    ],
    "signal_sources": [
      "rss",
      "google_trends",
      "dark_social_stub"
    ],
    "capture_signals": {
      "public": [
        "Facebook · Pesquisas FGV",
        "Buscas lifelong learning"
      ],
      "dark_social": [
        "Grupos de interesse no WhatsApp"
      ]
    },
    "intelligence_focus": [
      "Educação como identidade pós-carreira",
      "Disposição para aprendizado contínuo",
      "Vínculo com prestígio da FGV"
    ],
    "delivery_outputs": [
      "Programas de lifelong learning",
      "Posicionamento institucional de legado",
      "Novos vínculos pós-carreira com a FGV"
    ]
  }
]

REGIONS = [
  {
    "id": "norte",
    "label": "Norte"
  },
  {
    "id": "nordeste",
    "label": "Nordeste"
  },
  {
    "id": "centro_oeste",
    "label": "Centro-Oeste"
  },
  {
    "id": "sudeste",
    "label": "Sudeste"
  },
  {
    "id": "sul",
    "label": "Sul"
  }
]

LAYERS = [
  {
    "id": "capture",
    "number": 1,
    "label": "Captação de Sinais",
    "description": "Digital · Dark Social · FGV",
    "dimension": "Escuta etnográfica"
  },
  {
    "id": "intelligence",
    "number": 2,
    "label": "Inteligência",
    "description": "IA · NLP · Significado · Emoção",
    "dimension": "Semiótica · Psicologia"
  },
  {
    "id": "delivery",
    "number": 3,
    "label": "Entregas",
    "description": "Narrativas e insights acionáveis",
    "dimension": "Não dados — direção"
  }
]

SOURCES = [
  {
    "id": "google_trends",
    "type": "live",
    "adapter": "GoogleTrendsAdapter",
    "schedule": "0 8 * * *",
    "platform": "google_trends",
    "config": {
      "keywords": [
        "ENEM",
        "vestibular",
        "MBA",
        "pós-graduação",
        "educação executiva",
        "lifelong learning"
      ],
      "geo": "BR"
    },
    "generation_mapping": {
      "rule": "keyword_classifier"
    },
    "outputs": {
      "entity": "raw_signals"
    }
  },
  {
    "id": "reddit",
    "type": "live",
    "adapter": "RedditAdapter",
    "schedule": "0 6 * * *",
    "platform": "reddit",
    "config": {
      "subreddits": [
        "brasil",
        "desabafos",
        "faculdade",
        "enem"
      ],
      "search_queries": [
        "educação",
        "vestibular",
        "MBA Brasil"
      ]
    },
    "generation_mapping": {
      "rule": "keyword_classifier",
      "fallback": "llm_classify"
    },
    "outputs": {
      "entity": "raw_signals"
    }
  },
  {
    "id": "rss",
    "type": "live",
    "adapter": "RssAdapter",
    "schedule": "0 9 * * *",
    "platform": "rss",
    "config": {
      "feeds": [
        {
          "url": "https://www.gov.br/mec/pt-br/rss",
          "label": "MEC"
        },
        {
          "url": "https://www.estadao.com.br/rss/educacao",
          "label": "Estadão Educação"
        }
      ]
    },
    "generation_mapping": {
      "rule": "keyword_classifier",
      "fallback": "llm_classify"
    },
    "outputs": {
      "entity": "raw_signals"
    }
  },
  {
    "id": "dark_social_stub",
    "type": "stub",
    "adapter": "DarkSocialStubAdapter",
    "schedule": "0 10 * * *",
    "platform": "whatsapp",
    "config": {
      "fixture_file": "data/seeds/dark_social.json"
    },
    "generation_mapping": {
      "rule": "fixture"
    },
    "outputs": {
      "entity": "raw_signals"
    }
  },
  {
    "id": "fgv_internal_stub",
    "type": "stub",
    "adapter": "FGVInternalStubAdapter",
    "schedule": "0 12 * * 1",
    "platform": "fgv",
    "config": {
      "fixture_file": "data/seeds/fgv_internal.json"
    },
    "generation_mapping": {
      "rule": "fixture"
    },
    "outputs": {
      "entity": "raw_signals"
    }
  },
  {
    "id": "tgi_kantar_stub",
    "type": "stub",
    "adapter": "TGIKantarStubAdapter",
    "schedule": "0 11 * * 1",
    "platform": "tgi_kantar",
    "config": {
      "fixture_file": "data/seeds/tgi_weights.json"
    },
    "outputs": {
      "entity": "tgi_weights"
    }
  },
  {
    "id": "youtube",
    "type": "live",
    "adapter": "YouTubeAdapter",
    "schedule": "0 7 * * *",
    "platform": "youtube",
    "config": {
      "search_queries": [
        "educação infantil Brasil",
        "vestibular ENEM",
        "MBA executivo",
        "educação executiva"
      ],
      "max_results": 25
    },
    "generation_mapping": {
      "rule": "keyword_classifier",
      "fallback": "llm_classify"
    },
    "outputs": {
      "entity": "raw_signals"
    }
  }
]
