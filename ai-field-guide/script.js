// ============ STATE ============
  const answers = { destination: null, records: null, autonomy: null, flow: null, time: null };
  const notes = { destination: '', records: '', autonomy: '', flow: '', time: '' };
  let projectName = '';
  let lastChange = null; // { direction: 'simpler'|'bigger', key, fromLabel, toLabel }

  const questionOrder = ['destination', 'records', 'autonomy', 'flow', 'time'];
  let currentStep = 0;

  // Numeric scale per dimension — index in array = level
  const scales = {
    destination: ['me', 'team', 'org'],
    records: ['public', 'internal', 'client'],
    autonomy: ['suggest', 'draft', 'act'],
    flow: ['standalone', 'connected', 'embedded'],
    time: ['experiment', 'owned', 'product']
  };

  // ============ ARCHETYPES ============
  const archetypes = {
    'me-public': { name: 'The Sandbox', summary: 'A personal playground for learning what AI tools can do — without breaking anything.' },
    'me-internal': { name: 'The Workbench', summary: 'Your private power tool. Locally hosted, your data, your rules. The smart starting point.' },
    'me-client': { name: 'The Solo Practice', summary: 'You, alone, with someone else\'s data. Powerful, but you\'re now operating under professional standards.' },
    'team-public': { name: 'The Lab', summary: 'Shared experiments that lift the whole team. The right place to learn what works before scaling.' },
    'team-internal': { name: 'The Workshop', summary: 'Where the team actually gets faster. Grounded in your firm\'s knowledge, used daily on real work.' },
    'team-client': { name: 'The Practice Tool', summary: 'Team-grade client work. Real productivity, real exposure. Proceed deliberately.' },
    'org-public': { name: 'The Showcase', summary: 'Public-facing AI as a marketing channel. The firm\'s brand on the line, every interaction.' },
    'org-internal': { name: 'The Operating System', summary: 'AI as the firm\'s collective memory. A genuine competitive asset, and a serious build.' },
    'org-client': { name: 'The Platform', summary: 'A productised client service. You are now a software company. Resource accordingly.' }
  };

  // ============ BUILD COMPLEXITY ============
  // Complexity tiers based on weighted score across dimensions
  const complexityTiers = [
    {
      key: 'rightnow',
      icon: '✦',
      tier: 'Tier 0',
      title: 'Right Now!',
      blurb: 'You can build this in 30 seconds. Open Claude, ChatGPT or Copilot, screenshot the agent builder, paste it back with your idea, and let the AI write the configuration for you. No skills required. The point is to prove to yourself it\'s this easy.',
      builder: 'You + your AI',
      timeframe: '30 seconds – 5 minutes',
      stack: 'A screenshot and a prompt',
      color: '#5BC9D6',
      examplePrompt: 'I\'m looking at the [Custom GPT / Copilot Agent / Claude Project] builder screen [attach screenshot]. I want to build a tool that [your one-line idea — e.g. "drafts BAS commentary from a trial balance"]. Based on the fields visible in the screenshot, write me the name, description, instructions and any starter prompts. Keep it practical and tailored to an Australian accounting context.'
    },
    {
      key: 'weekend',
      icon: '◐',
      tier: 'Tier 1',
      title: 'Weekend Build',
      blurb: 'You can ship this yourself. No code required. Use the consumer AI tools you already have — Custom GPTs, Claude Projects, Copilot Agents. The whole point is to start.',
      builder: 'You',
      timeframe: '1–2 weekends',
      stack: 'Consumer AI tools',
      color: 'var(--teal)'
    },
    {
      key: 'sprint',
      icon: '◑',
      tier: 'Tier 2',
      title: 'Sprint Build',
      blurb: 'Two to four weeks of focused work. You can lead it, but you\'ll want a colleague who knows your firm\'s data and a basic no-code or low-code platform.',
      builder: 'You + a colleague',
      timeframe: '2–4 weeks',
      stack: 'No-code / low-code',
      color: '#7AAE5F'
    },
    {
      key: 'project',
      icon: '◕',
      tier: 'Tier 3',
      title: 'Project Build',
      blurb: 'A genuine project. Two to three months, real engineering, real change management. You\'re the sponsor — bring in IT, security, and a developer or vendor.',
      builder: 'You + IT + a developer',
      timeframe: '2–3 months',
      stack: 'Custom integration / platform',
      color: '#D4A03A'
    },
    {
      key: 'program',
      icon: '●',
      tier: 'Tier 4',
      title: 'Program Build',
      blurb: 'A funded program with a steering group, a roadmap, and a multi-disciplinary team. Before you build, ask whether you should buy. Most firms shouldn\'t build at this level.',
      builder: 'You + a team (or buy)',
      timeframe: '6+ months',
      stack: 'Enterprise platform / vendor',
      color: 'var(--primary)'
    }
  ];

  // ============ S.T.A.C.K. CONTENT ============
  // Five layers × five tiers. Each cell describes what the layer looks like at that tier.
  const stackLayers = [
    {
      key: 'storage',
      letter: 'S',
      word: 'Storage',
      role: 'Where your data lives at rest',
      tiers: {
        rightnow: {
          summary: 'No storage needed. Your data lives in the prompt itself, or in the AI tool\'s built-in memory. If you want a knowledge base, drop a couple of files into M365 Copilot, a Claude Project, or a Custom GPT.',
          tools: ['M365 Copilot files', 'Claude Project knowledge', 'Custom GPT files', 'Gemini Gem files'],
          flag: 'Anything you paste into a consumer AI may be retained — never client data here.'
        },
        weekend: {
          summary: 'A folder structure on familiar ground. OneDrive or Google Drive for documents; SharePoint, Notion, or Google Sheets for structured reference data the AI can read.',
          tools: ['OneDrive / SharePoint', 'Google Drive', 'Notion', 'Google Sheets / Excel', 'Airtable'],
          flag: 'Keep it organised. A messy knowledge base produces messy AI output.'
        },
        sprint: {
          summary: 'A real database or list-style store, shared across the team with versioning and access control. Microsoft Lists or Dataverse if you\'re an M365 shop; Supabase or Airtable if you\'re going faster.',
          tools: ['Microsoft Lists / Dataverse', 'Supabase', 'Airtable', 'Notion (team)', 'PostgreSQL'],
          flag: 'Decide who can read vs write before you build the schema.'
        },
        project: {
          summary: 'Production-grade database with backups, encryption at rest, and an explicit data model. Often paired with a vector store for RAG (retrieval-augmented generation).',
          tools: ['Azure SQL', 'Azure AI Search', 'Supabase (paid)', 'PostgreSQL', 'Pinecone', 'Google Cloud SQL'],
          flag: 'Data residency matters. Confirm where data physically lives before contracts go out.'
        },
        program: {
          summary: 'Enterprise data platform with governance, lineage tracking, and tiered access. Likely already exists — your job is to integrate, not invent.',
          tools: ['Microsoft Fabric', 'Azure Synapse', 'Snowflake', 'Databricks', 'Enterprise vector store'],
          flag: 'Don\'t build a parallel data estate. Plug into the firm\'s system of record.'
        }
      }
    },
    {
      key: 'thoughts',
      letter: 'T',
      word: 'Thoughts',
      role: 'The LLM that does the thinking',
      tiers: {
        rightnow: {
          summary: 'A consumer AI subscription. The free or paid tier you\'re already using is enough — and you almost certainly already have one through your M365 or Google Workspace licence.',
          tools: ['M365 Copilot', 'Google Gemini', 'ChatGPT Plus', 'Claude Pro'],
          flag: 'Free tiers usually train on your inputs. Paid tiers usually don\'t — but check the terms.'
        },
        weekend: {
          summary: 'The same consumer AI, configured through its agent / project builder. Copilot Studio is where most M365 firms will start; Custom GPTs and Claude Projects are the equivalents for those platforms.',
          tools: ['Copilot Studio', 'Custom GPTs', 'Claude Projects', 'Gemini Gems'],
          flag: 'Pick one platform and stick with it. Switching halfway through wastes the prompt-engineering work.'
        },
        sprint: {
          summary: 'API access to a chosen model, called from your no-code platform or thin wrapper. Azure OpenAI is the natural step up if you\'re an M365 shop; Bedrock and Vertex AI for AWS and Google clouds.',
          tools: ['Azure OpenAI', 'Anthropic API', 'OpenAI API', 'Vertex AI', 'AWS Bedrock'],
          flag: 'Token costs add up. Set a budget alert before users start hitting the API.'
        },
        project: {
          summary: 'Enterprise-tier API with a contract that prohibits training on your data. Possibly multiple models for different tasks (cheap + smart).',
          tools: ['Azure OpenAI (enterprise)', 'Anthropic Enterprise', 'AWS Bedrock', 'Vertex AI'],
          flag: 'Negotiate zero-retention up front. Don\'t assume defaults — they vary by provider.'
        },
        program: {
          summary: 'Multi-model strategy with fallbacks, prompt caching, model routing, and possibly fine-tuned or self-hosted models for sensitive workloads.',
          tools: ['Multi-provider gateway', 'LiteLLM / Portkey', 'Self-hosted (Llama, Mistral)', 'Fine-tuned models'],
          flag: 'Vendor diversity is a feature, not a cost — design to swap models as the market shifts.'
        }
      }
    },
    {
      key: 'auth',
      letter: 'A',
      word: 'Auth',
      role: 'Who\'s allowed in, and what they can do',
      tiers: {
        rightnow: {
          summary: 'Your own login to the AI tool. That\'s the entire auth layer — your existing M365 or Google account is doing all the work.',
          tools: ['Your M365 / Google / Anthropic / OpenAI account'],
          flag: 'Don\'t share your login. If others need access, they need their own seats.'
        },
        weekend: {
          summary: 'Still your account, possibly shared with one or two trusted colleagues via the platform\'s native sharing — within your M365 tenant or Google Workspace, not outside it.',
          tools: ['Copilot Agent sharing (M365 tenant)', 'Custom GPT sharing', 'Claude Project members', 'Google Drive sharing'],
          flag: 'Sharing inside your M365 or Google tenant is fine. Sharing outside it is rarely fine.'
        },
        sprint: {
          summary: 'SSO tied to your firm\'s identity provider. Real user accounts, real audit trail. Microsoft Entra ID for M365 firms; Google Workspace SSO for Google firms.',
          tools: ['Microsoft Entra ID', 'Google Workspace SSO', 'Okta', 'Auth0'],
          flag: 'Use existing groups. Don\'t invent new permission models — your IT team already has one.'
        },
        project: {
          summary: 'SSO + role-based access control. Different users see different things. MFA mandatory for anything client-facing.',
          tools: ['Entra ID with conditional access', 'Auth0 with RBAC', 'AWS Cognito'],
          flag: 'Audit access reviews quarterly. Stale permissions are how breaches happen.'
        },
        program: {
          summary: 'Full IAM integration. Service accounts, secret rotation, just-in-time access, audit logging tied into the firm\'s SIEM.',
          tools: ['Enterprise IAM (Entra, Okta)', 'HashiCorp Vault', 'Azure Key Vault', 'CyberArk'],
          flag: 'Auth is a security project, not a feature. Get InfoSec involved from day one.'
        }
      }
    },
    {
      key: 'compute',
      letter: 'C',
      word: 'Compute',
      role: 'Where the code actually runs',
      tiers: {
        rightnow: {
          summary: 'Nothing of your own. The AI platform — Copilot, Claude, ChatGPT, Gemini — runs everything for you. No code, no hosting.',
          tools: ['n/a — the platform is the compute'],
          flag: 'You\'re trading control for convenience. That\'s the right trade at this tier.'
        },
        weekend: {
          summary: 'Still nothing of your own. The agent / GPT / Project runs inside the consumer platform.',
          tools: ['Copilot Studio runtime', 'Custom GPT runtime', 'Claude Project runtime', 'Gemini runtime'],
          flag: 'If the platform changes its agent rules, your tool changes with it.'
        },
        sprint: {
          summary: 'Lightweight automation or hosting. Power Automate or Google Apps Script if you\'re staying inside familiar productivity stacks; Make / n8n / Netlify / Vercel for purpose-built no-code or thin web apps.',
          tools: ['Power Automate', 'Google Apps Script', 'Make / n8n', 'Netlify', 'Vercel'],
          flag: 'Free tiers have rate limits. A demo that goes viral can cost real money fast.'
        },
        project: {
          summary: 'Production hosting with environments (dev / staging / prod), CI/CD, and basic monitoring.',
          tools: ['Azure App Service / Functions', 'AWS Lambda / ECS', 'Google Cloud Run', 'Vercel (paid)'],
          flag: 'Containerise from the start. It\'s a small upfront cost and a huge later saving.'
        },
        program: {
          summary: 'Enterprise infrastructure inside your firm\'s cloud account, with networking controls, private endpoints, and full Infrastructure-as-Code.',
          tools: ['Azure (enterprise tenant)', 'AWS Organizations', 'Google Cloud (enterprise)', 'Kubernetes', 'Terraform / Bicep'],
          flag: 'Your firm probably has a paved-road platform. Use it — don\'t reinvent.'
        }
      }
    },
    {
      key: 'kpis',
      letter: 'K',
      word: 'KPIs',
      role: 'What you measure to know it\'s working',
      tiers: {
        rightnow: {
          summary: 'Did I use it twice this week? That\'s the only KPI that matters.',
          tools: ['Your own gut feel'],
          flag: 'If you didn\'t use it, the experiment failed. Be honest with yourself.'
        },
        weekend: {
          summary: 'Informal: how many times you used it, what worked, what didn\'t. A note in OneNote, Google Keep, or your phone is enough.',
          tools: ['OneNote', 'Google Keep', 'Notes app', 'A weekly review in your diary'],
          flag: 'Without measurement you\'ll keep tweaking forever. Set a 2-week decision date.'
        },
        sprint: {
          summary: 'Track usage, errors, time-to-output, and rough cost per use. A Google Sheet or Power BI dashboard works just as well as a fancy analytics tool at this stage.',
          tools: ['Google Sheets', 'Power BI', 'Platform analytics', 'PostHog', 'A shared Notion page'],
          flag: 'Pick three KPIs maximum. More than that and no one looks at any of them.'
        },
        project: {
          summary: 'Real observability — logs, traces, alerts, cost monitoring. Quality evals running on a sample of outputs.',
          tools: ['Application Insights', 'Datadog', 'Langfuse / Helicone', 'Power BI', 'Custom eval harness'],
          flag: 'Quality silently degrades when models update. Run evals weekly, not yearly.'
        },
        program: {
          summary: 'Full observability stack with SLOs, on-call rotation, automated quality gates, and cost attribution per business unit.',
          tools: ['Enterprise APM (Datadog, Dynatrace)', 'Custom eval pipelines', 'FinOps tooling', 'SIEM integration'],
          flag: 'Treat AI quality as a service — it needs its own metrics, owners, and incident response.'
        }
      }
    }
  ];

  function complexityScore() {
    // Weighted: scale and integration depth matter most for complexity
    return (
      scales.destination.indexOf(answers.destination) * 2 +   // 0, 2, 4
      scales.records.indexOf(answers.records) * 1.5 +         // 0, 1.5, 3
      scales.autonomy.indexOf(answers.autonomy) * 1 +         // 0, 1, 2
      scales.flow.indexOf(answers.flow) * 2 +                 // 0, 2, 4
      scales.time.indexOf(answers.time) * 1.5                 // 0, 1.5, 3
    );
    // Range: 0 to 16
  }

  function getComplexityTier() {
    const score = complexityScore();
    if (score <= 1) return complexityTiers[0];   // right now (only the very simplest profiles)
    if (score <= 5) return complexityTiers[1];   // weekend
    if (score <= 9) return complexityTiers[2];   // sprint
    if (score <= 13) return complexityTiers[3];  // project
    return complexityTiers[4];                   // program
  }

  // ============ RISK (secondary now) ============
  function getRisk() {
    // Risk is mostly about data sensitivity and autonomy
    const dataIdx = scales.records.indexOf(answers.records);
    const autonomyIdx = scales.autonomy.indexOf(answers.autonomy);
    const scaleIdx = scales.destination.indexOf(answers.destination);

    let riskScore = dataIdx * 2 + autonomyIdx * 1.5 + scaleIdx * 1;
    // Embedded flow with sensitive data nudges risk
    if (answers.flow === 'embedded' && dataIdx > 0) riskScore += 1;

    if (riskScore <= 2) return 'low';
    if (riskScore <= 5) return 'medium';
    if (riskScore <= 8) return 'high';
    return 'critical';
  }

  const riskMessages = {
    low: 'Small blast radius. The right place to learn — go fast.',
    medium: 'Real exposure if it goes wrong. Worth a basic governance wrap before launch.',
    high: 'Serious professional and reputational exposure. Get advice on insurance, engagement terms, and review processes before launch.',
    critical: 'Regulatory, ethical and reputational risk at the level of a core service offering. Treat as a regulated product from day one.'
  };

  // ============ BUILD RECIPE ============
  function deriveBuildAndWatch() {
    const build = [];
    const watch = [];
    const tier = getComplexityTier();

    // Tier-specific guidance comes first
    if (tier.key === 'rightnow') {
      build.push('A free or paid Claude / ChatGPT / Copilot account — whatever you already have');
      build.push('A screenshot of the agent / GPT / Project builder screen you want to fill in');
      build.push('One sentence describing what you want the tool to do');
      build.push('Five minutes to paste the AI\'s output back into the builder and try it');
    } else if (tier.key === 'weekend') {
      build.push('A consumer AI subscription you already have — ChatGPT Plus, Claude Pro, or M365 Copilot');
      build.push('A clear single-purpose prompt or Custom GPT / Claude Project setup');
      build.push('30 minutes a day for two weeks to refine and use it');
    } else if (tier.key === 'sprint') {
      build.push('A team subscription with shared workspace (Claude Team, ChatGPT Team, or Copilot Studio)');
      build.push('A no-code or low-code platform you\'re comfortable in (Power Automate, Make, n8n)');
      build.push('A colleague who knows the data and the workflow you\'re trying to improve');
    } else if (tier.key === 'project') {
      build.push('Engagement with your IT team or an external developer / vendor partner');
      build.push('A scoped statement of work, success criteria, and a budget');
      build.push('Enterprise LLM contract with appropriate data handling clauses');
    } else {
      build.push('A funded program with a sponsor, steering group, and dedicated resources');
      build.push('Serious vendor evaluation before committing to build — buy is usually cheaper');
      build.push('Legal, security, compliance and risk all in the room from day one');
    }

    // Records-specific additions
    if (answers.records === 'internal' && (tier.key === 'rightnow' || tier.key === 'weekend')) {
      watch.push('Internal IP can leak via consumer tools — confirm provider terms before pasting anything sensitive');
    }
    if (answers.records === 'client') {
      build.push('Updated engagement letters and explicit client consent for AI processing');
      watch.push('APES 110, Privacy Act and TPB obligations all apply — get advice before launch');
      watch.push('Most consumer LLM terms are not fit for client data — read the fine print or use an enterprise tier');
    }

    // Autonomy-specific
    if (answers.autonomy === 'draft') {
      build.push('A clear review and sign-off workflow before output is used');
      watch.push('Quality control failures scale faster than they did manually — design the review step in');
    } else if (answers.autonomy === 'act') {
      build.push('Hard guardrails on what it can and can\'t do autonomously, with comprehensive logging');
      watch.push('Liability for autonomous actions sits with you, not the AI — make sure you can defend each one');
    }

    // Fit-specific (internal key: flow)
    if (answers.flow === 'connected') {
      watch.push('Vendor API changes can break it overnight — plan for ongoing maintenance');
    } else if (answers.flow === 'embedded') {
      build.push('Monitoring, alerting, and incident response for when (not if) things break');
      watch.push('Embedded tools are infrastructure — treat them with the same care as the rest of your stack');
    }

    // Transfer-specific (internal key: time)
    if (answers.time === 'experiment') {
      watch.push('Set a sunset date now — abandoned tools become professional risk over time');
    } else if (answers.time === 'product') {
      build.push('Disaster recovery and business continuity planning');
    }

    return { build, watch };
  }

  // ============ NEXT STEP ============
  function getNextStep() {
    const tier = getComplexityTier();
    if (tier.key === 'rightnow') {
      return 'Do this in the next five minutes. Open Claude, ChatGPT or Copilot in one tab, and the agent / GPT / Project builder in another. Screenshot the builder, paste the prompt above with your idea, and let the AI write the configuration. Copy it back, hit save, and use it. The whole point is to prove how easy it is.';
    } else if (tier.key === 'weekend') {
      return 'Start tonight. Open ChatGPT, Claude or Copilot, set up the project, and use it once tomorrow on a real task. Build doesn\'t mean code — it means use. Ship the first version this weekend, refine over two weeks, then decide if it\'s worth scaling up.';
    } else if (tier.key === 'sprint') {
      return 'Run a 2–4 week build with one colleague. Pick a platform, scope it tight, and put it in front of three real users by week three. If it works, decide whether to scale or productise. If it doesn\'t, kill it cleanly and move on.';
    } else if (tier.key === 'project') {
      return 'Treat this as a real project. Get a sponsor, a budget, a security review, and a developer or vendor partner before you start. The build is the easy part — adoption and governance are where this lives or dies. Plan for a 2–3 month delivery and a 6 month bedding-in period.';
    } else {
      return 'Before you build, ask whether you should buy. At this scope, the make-vs-buy decision is the most expensive one you\'ll make. Run a serious vendor evaluation, talk to firms that have built at this level, and be honest about whether you want to be a software company.';
    }
  }

  // ============ ITERATION ============
  // Find the dimension to step down (or up) — the one that will most reduce (or increase) complexity score
  // Priority: destination > flow (Fit) > records > time (Transfer) > autonomy
  const stepPriority = ['destination', 'flow', 'records', 'time', 'autonomy'];

  const choiceLabelsShort = {
    destination: { me: 'Me', team: 'Team', org: 'Org' },
    records: { public: 'Public data', internal: 'Internal data', client: 'Client data' },
    autonomy: { suggest: 'Suggests', draft: 'Drafts', act: 'Acts' },
    flow: { standalone: 'Separate', connected: 'Linked', embedded: 'Embedded' },
    time: { experiment: 'No transfer', owned: 'Named owner', product: 'Funded function' }
  };

  function simplify() {
    // Find the first dimension (by priority) that is not at minimum
    for (const key of stepPriority) {
      const idx = scales[key].indexOf(answers[key]);
      if (idx > 0) {
        const fromLabel = choiceLabelsShort[key][answers[key]];
        answers[key] = scales[key][idx - 1];
        const toLabel = choiceLabelsShort[key][answers[key]];
        lastChange = {
          direction: 'simpler',
          key,
          fromLabel,
          toLabel,
          message: `Stepped ${letterMap[key].word} down: ${fromLabel} → ${toLabel}. This is your scoped-down MVP. Build this first, learn, then graduate.`
        };
        return true;
      }
    }
    return false;
  }

  function ambitionUp() {
    // Find the first dimension (by priority) that is not at max
    for (const key of stepPriority) {
      const idx = scales[key].indexOf(answers[key]);
      if (idx < scales[key].length - 1) {
        const fromLabel = choiceLabelsShort[key][answers[key]];
        answers[key] = scales[key][idx + 1];
        const toLabel = choiceLabelsShort[key][answers[key]];
        lastChange = {
          direction: 'bigger',
          key,
          fromLabel,
          toLabel,
          message: `Stepped ${letterMap[key].word} up: ${fromLabel} → ${toLabel}. This is the version with more reach — bigger build, bigger payoff, bigger investment.`
        };
        return true;
      }
    }
    return false;
  }

  function isSimplest() {
    return stepPriority.every(key => scales[key].indexOf(answers[key]) === 0);
  }

  function isMostAmbitious() {
    return stepPriority.every(key => scales[key].indexOf(answers[key]) === scales[key].length - 1);
  }

  // ============ LABELS ============
  const choiceLabels = {
    destination: { me: 'Just me', team: 'My team', org: 'The whole firm (or beyond)' },
    records: { public: 'Public or synthetic data only', internal: 'Internal firm data', client: 'Client or regulated data' },
    autonomy: { suggest: 'Suggests — I decide', draft: 'Drafts — I review and sign off', act: 'Acts — within guardrails' },
    flow: { standalone: 'Separate — opens on its own', connected: 'Linked — talks to one or two systems', embedded: 'Embedded — woven through the workflow' },
    time: { experiment: 'No transfer — stays with me', owned: 'Transferred to a named owner', product: 'Transferred to a funded function' }
  };

  const letterMap = {
    destination: { letter: 'D', word: 'Destination' },
    records: { letter: 'R', word: 'Records' },
    autonomy: { letter: 'A', word: 'Autonomy' },
    flow: { letter: 'F', word: 'Fit' },
    time: { letter: 'T', word: 'Transfer' }
  };

  // ============ RENDERING ============
  function showStep(step) {
    document.getElementById('intro').classList.toggle('active', step === 0);
    document.getElementById('result').classList.toggle('active', step === 6);
    document.getElementById('stackScreen').classList.toggle('active', step === 7);
    document.querySelectorAll('.question-screen').forEach((el, i) => {
      el.classList.toggle('active', step === i + 1);
    });
    document.getElementById('progressBar').style.display = (step >= 1 && step <= 5) ? 'grid' : 'none';
    document.getElementById('projectBar').classList.toggle('visible', step >= 1 && step <= 5);
    updateProgress(step);
    if (step === 6) renderResult();
    if (step === 7) renderStack();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress(step) {
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.toggle('active', stepNum === step);
      el.classList.toggle('complete', stepNum < step);
      el.classList.toggle('locked', stepNum > step);
    });
  }

  function updateNextButtons() {
    document.querySelectorAll('.question-screen').forEach((screen, i) => {
      const key = questionOrder[i];
      const nextBtn = screen.querySelector('[data-nav="next"]');
      if (nextBtn) nextBtn.disabled = !answers[key];
    });
  }

  function renderResult() {
    const archKey = `${answers.destination}-${answers.records}`;
    const arch = archetypes[archKey];
    const tier = getComplexityTier();
    const risk = getRisk();
    const { build, watch } = deriveBuildAndWatch();

    const cleanName = arch.name.startsWith('The ') ? 'The <em>' + arch.name.slice(4) + '</em>' : arch.name;
    document.getElementById('resultName').innerHTML = cleanName;
    document.getElementById('resultSummary').textContent = arch.summary;
    document.getElementById('resultProject').textContent = projectName ? `Project: ${projectName}` : '';

    // Complexity hero
    document.getElementById('complexityIcon').textContent = tier.icon;
    document.getElementById('complexityTier').textContent = tier.tier;
    document.getElementById('complexityTitle').textContent = tier.title;
    document.getElementById('complexityBlurb').textContent = tier.blurb;
    document.getElementById('complexityMarker').style.setProperty('--complexity-color', tier.color);

    const tagsContainer = document.getElementById('complexityTags');
    tagsContainer.innerHTML = '';
    const tags = [
      { label: tier.builder, builder: true },
      { label: tier.timeframe, builder: false },
      { label: tier.stack, builder: false }
    ];
    tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'complexity-tag' + (t.builder ? ' builder' : '');
      span.textContent = t.label;
      tagsContainer.appendChild(span);
    });

    // Prompt box (Right Now! tier only)
    const promptBox = document.getElementById('promptBox');
    if (tier.examplePrompt) {
      promptBox.classList.add('visible');
      document.getElementById('promptBoxBody').textContent = tier.examplePrompt;
    } else {
      promptBox.classList.remove('visible');
    }

    // Change banner
    const changeBanner = document.getElementById('changeBanner');
    if (lastChange) {
      changeBanner.classList.add('visible');
      changeBanner.classList.toggle('bigger', lastChange.direction === 'bigger');
      document.getElementById('changeBannerLabel').textContent = lastChange.direction === 'simpler' ? 'Simpler' : 'More ambitious';
      document.getElementById('changeBannerText').textContent = lastChange.message;
    } else {
      changeBanner.classList.remove('visible');
    }

    // Iteration buttons
    document.getElementById('simplerBtn').disabled = isSimplest();
    document.getElementById('biggerBtn').disabled = isMostAmbitious();

    // Next step
    document.getElementById('resultNext').textContent = getNextStep();

    // Canvas
    const canvasContainer = document.getElementById('canvasRows');
    canvasContainer.innerHTML = '';
    questionOrder.forEach(key => {
      const row = document.createElement('div');
      row.className = 'canvas-row';
      const noteText = notes[key] && notes[key].trim()
        ? `<div class="canvas-context">"${escapeHtml(notes[key].trim())}"</div>`
        : '<div class="canvas-context empty">— no notes added —</div>';
      const changedMarker = (lastChange && lastChange.key === key)
        ? ` <span class="changed-marker${lastChange.direction === 'bigger' ? ' bigger' : ''}">${lastChange.direction === 'simpler' ? 'Simplified' : 'Stepped up'}</span>`
        : '';
      row.innerHTML = `
        <div class="canvas-letter-block">
          <div class="canvas-letter">${letterMap[key].letter}</div>
          <div class="canvas-word">${letterMap[key].word}</div>
        </div>
        <div class="canvas-content">
          <div class="canvas-choice">${choiceLabels[key][answers[key]]}${changedMarker}</div>
          ${noteText}
        </div>
      `;
      canvasContainer.appendChild(row);
    });

    // Build + watch lists
    const buildList = document.getElementById('resultBuild');
    buildList.innerHTML = '';
    build.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      buildList.appendChild(li);
    });

    const watchList = document.getElementById('resultWatch');
    watchList.innerHTML = '';
    if (watch.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No major watch-outs at this scope. Stay alert as ambition grows.';
      watchList.appendChild(li);
    } else {
      watch.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        watchList.appendChild(li);
      });
    }

    // Risk (secondary)
    const riskCallout = document.getElementById('riskCallout');
    riskCallout.className = 'risk-callout ' + risk;
    const riskEl = document.getElementById('riskLevel');
    riskEl.textContent = risk.charAt(0).toUpperCase() + risk.slice(1);
    riskEl.className = 'risk-level ' + risk;
    document.getElementById('riskText').textContent = riskMessages[risk];
  }

  function renderStack() {
    const tier = getComplexityTier();
    document.getElementById('stackProject').textContent = projectName ? `Project: ${projectName}` : '';
    document.getElementById('stackTierName').textContent = tier.title;
    document.getElementById('stackTierLabel').textContent = `${tier.tier} · ${tier.title}`;
    document.getElementById('stackTierIcon').textContent = tier.icon;
    document.getElementById('stackTierBanner').style.setProperty('--tier-color', tier.color);

    const tagsContainer = document.getElementById('stackTierTags');
    tagsContainer.innerHTML = '';
    [
      { label: tier.builder, builder: true },
      { label: tier.timeframe, builder: false },
      { label: tier.stack, builder: false }
    ].forEach(t => {
      const span = document.createElement('span');
      span.className = 'complexity-tag' + (t.builder ? ' builder' : '');
      span.textContent = t.label;
      tagsContainer.appendChild(span);
    });

    // Stack cards — render five layers with tier-specific content
    const cardsContainer = document.getElementById('stackCards');
    cardsContainer.innerHTML = '';
    stackLayers.forEach(layer => {
      const cell = layer.tiers[tier.key];
      const card = document.createElement('div');
      card.className = 'stack-card';

      const toolsHtml = cell.tools.map(t =>
        `<span class="stack-tool-tag">${escapeHtml(t)}</span>`
      ).join('');

      card.innerHTML = `
        <div class="stack-card-header">
          <div class="stack-card-letter-block">
            <div class="stack-card-letter">${layer.letter}</div>
            <div class="stack-card-word">${escapeHtml(layer.word)}</div>
          </div>
          <div class="stack-card-titles">
            <div class="stack-card-title">${escapeHtml(layer.word)}</div>
            <div class="stack-card-role">${escapeHtml(layer.role)}</div>
          </div>
        </div>
        <div class="stack-card-body">
          <div class="stack-card-summary">${escapeHtml(cell.summary)}</div>
          <div class="stack-tools-label">Suggested tools at this tier</div>
          <div class="stack-card-tools">${toolsHtml}</div>
          <div class="stack-card-flag">${escapeHtml(cell.flag)}</div>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    // Iteration banner on stack screen
    const banner = document.getElementById('stackChangeBanner');
    if (lastChange) {
      banner.classList.add('visible');
      banner.classList.toggle('bigger', lastChange.direction === 'bigger');
      document.getElementById('stackChangeBannerLabel').textContent = lastChange.direction === 'simpler' ? 'Simpler' : 'More ambitious';
      document.getElementById('stackChangeBannerText').textContent = lastChange.message;
    } else {
      banner.classList.remove('visible');
    }

    // Iteration buttons enable/disable
    document.getElementById('stackSimplerBtn').disabled = isSimplest();
    document.getElementById('stackBiggerBtn').disabled = isMostAmbitious();

    // Architecture diagram (re-render if visible)
    if (document.getElementById('architectureSection').classList.contains('visible')) {
      renderArchitecture();
    }
  }

  // ============ ARCHITECTURE DIAGRAM ============
  function renderArchitecture() {
    const tier = getComplexityTier();
    const svg = document.getElementById('architectureSvg');

    // Caption
    const caption = `For a ${tier.title}, here's how the five layers fit together — labelled with the tools that fit your tier.`;
    document.getElementById('architectureCaption').textContent = caption;

    // Pull layer-specific tools (first 1-2 from each layer's tier data)
    const layerByKey = {};
    stackLayers.forEach(l => { layerByKey[l.key] = l.tiers[tier.key]; });

    const summarise = (key) => {
      const tools = layerByKey[key].tools;
      if (!tools || !tools.length) return '';
      const first = tools[0];
      // Special case for compute "n/a" — collapse to a friendlier line
      if (first.toLowerCase().startsWith('n/a')) return 'Runs inside the AI platform';
      // Pick the first 1 or 2 tools, but stay under ~32 chars
      const maxChars = 32;
      let result = first;
      if (tools.length > 1 && (first.length + 3 + tools[1].length) <= maxChars) {
        result = first + ' · ' + tools[1];
      } else if (first.length > maxChars) {
        // Truncate gracefully on a separator
        const cutAt = first.lastIndexOf(' / ', maxChars);
        result = (cutAt > 10 ? first.slice(0, cutAt) : first.slice(0, maxChars - 1)) + '…';
      }
      return result;
    };

    // Coords (matches viewBox 920x520)
    // Layout:
    //   USER (left) → AUTH → COMPUTE (centre)
    //   THOUGHTS (top right) feeds into COMPUTE
    //   STORAGE (bottom centre) feeds into COMPUTE
    //   KPIs (top, dashed observe arrow)
    const layout = {
      user:     { x: 30,  y: 220, w: 140, h: 80,  letter: 'U', title: 'User',     role: 'Who\'s asking', cls: 'user' },
      auth:     { x: 210, y: 220, w: 130, h: 80,  letter: 'A', title: 'Auth',     role: 'Who\'s allowed', cls: 'auth' },
      compute:  { x: 380, y: 200, w: 200, h: 120, letter: 'C', title: 'Compute',  role: 'Your app runs here', cls: 'compute' },
      thoughts: { x: 640, y: 80,  w: 240, h: 110, letter: 'T', title: 'Thoughts', role: 'The LLM',       cls: 'thoughts' },
      storage:  { x: 640, y: 320, w: 240, h: 110, letter: 'S', title: 'Storage',  role: 'Data at rest',  cls: 'storage' },
      kpis:     { x: 380, y: 30,  w: 200, h: 80,  letter: 'K', title: 'KPIs',     role: 'How you watch', cls: 'kpis' }
    };

    const boxLabel = (b, tools) => {
      const cx = b.x + 18;
      const titleX = b.x + 50;
      return `
        <rect class="arch-box ${b.cls}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" />
        <text class="arch-label-letter ${b.cls}-letter" x="${cx}" y="${b.y + 30}">${b.letter}</text>
        <text class="arch-label-title" x="${titleX}" y="${b.y + 26}">${b.title}</text>
        <text class="arch-label-role" x="${titleX}" y="${b.y + 42}">${b.role}</text>
        <text class="arch-label-tools" x="${b.x + 14}" y="${b.y + b.h - 14}">${escapeHtml(tools)}</text>
      `;
    };

    // Arrows
    const arrowHead = (x, y, dir = 'right', dashed = false) => {
      const cls = dashed ? 'arch-arrow-head dashed' : 'arch-arrow-head';
      // Triangle pointing right, left, up, down
      const pts = {
        right: `${x},${y} ${x-8},${y-5} ${x-8},${y+5}`,
        left:  `${x},${y} ${x+8},${y-5} ${x+8},${y+5}`,
        up:    `${x},${y} ${x-5},${y+8} ${x+5},${y+8}`,
        down:  `${x},${y} ${x-5},${y-8} ${x+5},${y-8}`
      }[dir];
      return `<polygon class="${cls}" points="${pts}" />`;
    };

    // Diagonal arrow head: rotates the polygon to match the line angle
    // from (fromX, fromY) heading toward (tipX, tipY). The triangle's tip sits at (tipX, tipY).
    const angleArrowHead = (fromX, fromY, tipX, tipY, dashed = false) => {
      const cls = dashed ? 'arch-arrow-head dashed' : 'arch-arrow-head';
      const angle = Math.atan2(tipY - fromY, tipX - fromX) * 180 / Math.PI;
      // Triangle drawn pointing right (tip at 0,0), then rotated about its tip
      const pts = `0,0 -10,-5 -10,5`;
      return `<polygon class="${cls}" points="${pts}" transform="translate(${tipX} ${tipY}) rotate(${angle})" />`;
    };

    // Build the SVG content
    const userTools = summarise('auth', 1); // user line is just "you" — keep simple
    const authTools = summarise('auth');
    const computeTools = summarise('compute');
    const thoughtsTools = summarise('thoughts');
    const storageTools = summarise('storage');
    const kpisTools = summarise('kpis');

    // The user box just shows "You" / "You + your team" / etc rather than tools
    const userLabel = (() => {
      const dest = answers.destination;
      if (dest === 'me') return 'You';
      if (dest === 'team') return 'Your team';
      return 'Your firm';
    })();

    let svgContent = '';

    // KPIs box (top, observation)
    svgContent += boxLabel(layout.kpis, kpisTools);
    // Dashed arrow from compute up to KPIs
    svgContent += `<path class="arch-arrow dashed" d="M 480 200 Q 480 150 480 118" />`;
    svgContent += arrowHead(480, 110, 'up', true);

    // User box
    svgContent += `
      <rect class="arch-box user" x="${layout.user.x}" y="${layout.user.y}" width="${layout.user.w}" height="${layout.user.h}" rx="8" />
      <text class="arch-label-letter user-letter" x="${layout.user.x + 18}" y="${layout.user.y + 32}">U</text>
      <text class="arch-label-title" x="${layout.user.x + 50}" y="${layout.user.y + 28}">${userLabel}</text>
      <text class="arch-label-role" x="${layout.user.x + 50}" y="${layout.user.y + 44}">Who's asking</text>
      <text class="arch-label-tools" x="${layout.user.x + 14}" y="${layout.user.y + layout.user.h - 14}">A request</text>
    `;

    // Arrow user → auth
    svgContent += `<line class="arch-arrow" x1="170" y1="260" x2="200" y2="260" />`;
    svgContent += arrowHead(208, 260, 'right');

    // Auth box
    svgContent += boxLabel(layout.auth, authTools);

    // Arrow auth → compute
    svgContent += `<line class="arch-arrow" x1="340" y1="260" x2="370" y2="260" />`;
    svgContent += arrowHead(378, 260, 'right');

    // Compute box (centre)
    svgContent += boxLabel(layout.compute, computeTools);

    // Compute (right edge x=580, centre y=260) ↔ Thoughts (left edge x=640, centre y=135)
    // Two arrows for bidirectional flow — angled paths

    // Compute → Thoughts (request)
    svgContent += `<path class="arch-arrow" d="M 580 230 L 640 145" />`;
    svgContent += angleArrowHead(580, 230, 640, 145);

    // Thoughts → Compute (response)
    svgContent += `<path class="arch-arrow" d="M 640 175 L 580 250" />`;
    svgContent += angleArrowHead(640, 175, 580, 250);

    // Compute (right edge) ↔ Storage (left edge x=640, centre y=375)
    // Compute → Storage (read/write)
    svgContent += `<path class="arch-arrow" d="M 580 290 L 640 365" />`;
    svgContent += angleArrowHead(580, 290, 640, 365);

    // Storage → Compute (return)
    svgContent += `<path class="arch-arrow" d="M 640 395 L 580 305" />`;
    svgContent += angleArrowHead(640, 395, 580, 305);

    // Thoughts box (top right)
    svgContent += boxLabel(layout.thoughts, thoughtsTools);

    // Storage box (bottom right)
    svgContent += boxLabel(layout.storage, storageTools);

    svg.innerHTML = svgContent;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildPlainSummary() {
    const archKey = `${answers.destination}-${answers.records}`;
    const arch = archetypes[archKey];
    const tier = getComplexityTier();
    const risk = getRisk();
    const { build, watch } = deriveBuildAndWatch();

    const lines = [];
    lines.push(`D.R.A.F.T. — ${projectName || 'Untitled AI Project'}`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`ARCHETYPE: ${arch.name}`);
    lines.push(arch.summary);
    lines.push('');
    lines.push(`BUILD COMPLEXITY: ${tier.title} (${tier.tier})`);
    lines.push(tier.blurb);
    lines.push(`Builder type: ${tier.builder}`);
    lines.push(`Timeframe: ${tier.timeframe}`);
    lines.push(`Stack: ${tier.stack}`);
    if (tier.examplePrompt) {
      lines.push('');
      lines.push('TRY IT NOW — COPY THIS PROMPT');
      lines.push('-'.repeat(60));
      lines.push(tier.examplePrompt);
    }
    lines.push('');
    lines.push(`RISK PROFILE: ${risk.charAt(0).toUpperCase() + risk.slice(1)}`);
    lines.push(riskMessages[risk]);
    lines.push('');
    lines.push('YOUR D.R.A.F.T. CANVAS');
    lines.push('-'.repeat(60));
    questionOrder.forEach(key => {
      lines.push(`${letterMap[key].letter} — ${letterMap[key].word}: ${choiceLabels[key][answers[key]]}`);
      if (notes[key] && notes[key].trim()) {
        lines.push(`   "${notes[key].trim()}"`);
      }
      lines.push('');
    });
    lines.push('NEXT STEP');
    lines.push('-'.repeat(60));
    lines.push(getNextStep());
    lines.push('');
    lines.push('WHAT YOU\'LL NEED');
    lines.push('-'.repeat(60));
    build.forEach(b => lines.push(`  → ${b}`));
    lines.push('');
    lines.push('WATCH-OUTS');
    lines.push('-'.repeat(60));
    if (watch.length === 0) {
      lines.push('  → No major watch-outs at this scope.');
    } else {
      watch.forEach(w => lines.push(`  → ${w}`));
    }
    return lines.join('\n');
  }

  function buildStackSummary() {
    const tier = getComplexityTier();
    const lines = [];
    lines.push(`S.T.A.C.K. — ${projectName || 'Untitled AI Project'}`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`TIER: ${tier.title} (${tier.tier})`);
    lines.push(`Builder: ${tier.builder} · Timeframe: ${tier.timeframe}`);
    lines.push('');
    stackLayers.forEach(layer => {
      const cell = layer.tiers[tier.key];
      lines.push(`${layer.letter} — ${layer.word.toUpperCase()}: ${layer.role}`);
      lines.push('-'.repeat(60));
      lines.push(cell.summary);
      lines.push('');
      lines.push(`Suggested tools: ${cell.tools.join(', ')}`);
      lines.push(`Watch: ${cell.flag}`);
      lines.push('');
    });
    return lines.join('\n');
  }

  function restoreInputState() {
    document.querySelectorAll('.options').forEach(group => {
      const key = group.dataset.options;
      group.querySelectorAll('.option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === answers[key]);
      });
    });
    document.querySelectorAll('[data-text]').forEach(input => {
      input.value = notes[input.dataset.text] || '';
    });
  }

  // ============ EVENTS ============
  document.getElementById('startBtn').addEventListener('click', () => {
    projectName = document.getElementById('projectNameMain').value.trim();
    document.getElementById('projectNameMini').value = projectName;
    currentStep = 1;
    showStep(currentStep);
  });

  document.getElementById('projectNameMain').addEventListener('input', e => {
    projectName = e.target.value;
    document.getElementById('projectNameMini').value = projectName;
  });
  document.getElementById('projectNameMini').addEventListener('input', e => {
    projectName = e.target.value;
    document.getElementById('projectNameMain').value = projectName;
  });

  document.querySelectorAll('.options').forEach(group => {
    const key = group.dataset.options;
    group.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answers[key] = btn.dataset.value;
        lastChange = null; // user-driven change clears the iteration banner
        updateNextButtons();
      });
    });
  });

  document.querySelectorAll('[data-text]').forEach(input => {
    const key = input.dataset.text;
    input.addEventListener('input', e => { notes[key] = e.target.value; });
  });

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.nav;
      if (dir === 'next') {
        currentStep++;
        if (currentStep > 5) currentStep = 6;
      } else {
        currentStep--;
        if (currentStep < 0) currentStep = 0;
      }
      showStep(currentStep);
    });
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    if (!confirm('Start over? This will clear your current project.')) return;
    Object.keys(answers).forEach(k => answers[k] = null);
    Object.keys(notes).forEach(k => notes[k] = '');
    projectName = '';
    lastChange = null;
    document.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.text-input').forEach(t => t.value = '');
    document.getElementById('projectNameMain').value = '';
    document.getElementById('projectNameMini').value = '';
    updateNextButtons();
    currentStep = 0;
    showStep(currentStep);
  });

  document.getElementById('changeBtn').addEventListener('click', () => {
    currentStep = 1;
    showStep(currentStep);
    restoreInputState();
  });

  document.getElementById('printBtn').addEventListener('click', () => window.print());

  document.getElementById('copyBtn').addEventListener('click', async () => {
    const text = buildPlainSummary();
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('copyBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Copied';
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    } catch (err) {
      alert('Copy failed. Try selecting and copying manually.');
    }
  });

  document.getElementById('promptCopyBtn').addEventListener('click', async () => {
    const promptText = document.getElementById('promptBoxBody').textContent;
    try {
      await navigator.clipboard.writeText(promptText);
      const btn = document.getElementById('promptCopyBtn');
      btn.textContent = '✓ Copied';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    } catch (err) {
      alert('Copy failed. Select the prompt text manually instead.');
    }
  });

  document.getElementById('simplerBtn').addEventListener('click', () => {
    if (simplify()) renderResult();
  });

  document.getElementById('biggerBtn').addEventListener('click', () => {
    if (ambitionUp()) renderResult();
  });

  // ============ STEP 2 (STACK) HANDLERS ============
  document.getElementById('goToStackBtn').addEventListener('click', () => {
    currentStep = 7;
    showStep(currentStep);
  });

  document.getElementById('backToDraftBtn').addEventListener('click', () => {
    currentStep = 6;
    showStep(currentStep);
  });

  document.getElementById('stackBackBtn').addEventListener('click', () => {
    currentStep = 6;
    showStep(currentStep);
  });

  document.getElementById('stackSimplerBtn').addEventListener('click', () => {
    if (simplify()) renderStack();
  });

  document.getElementById('stackBiggerBtn').addEventListener('click', () => {
    if (ambitionUp()) renderStack();
  });

  // Architecture toggle
  document.getElementById('architectureToggleBtn').addEventListener('click', () => {
    const btn = document.getElementById('architectureToggleBtn');
    const section = document.getElementById('architectureSection');
    const isOpen = section.classList.contains('visible');

    if (isOpen) {
      section.classList.remove('visible');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      section.classList.add('visible');
      btn.setAttribute('aria-expanded', 'true');
      renderArchitecture();
      // Smoothly scroll the diagram into view
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });

  document.getElementById('stackRestartBtn').addEventListener('click', () => {
    if (!confirm('Start over? This will clear your current project.')) return;
    Object.keys(answers).forEach(k => answers[k] = null);
    Object.keys(notes).forEach(k => notes[k] = '');
    projectName = '';
    lastChange = null;
    document.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.text-input').forEach(t => t.value = '');
    document.getElementById('projectNameMain').value = '';
    document.getElementById('projectNameMini').value = '';
    updateNextButtons();
    currentStep = 0;
    showStep(currentStep);
  });

  document.getElementById('stackPrintBtn').addEventListener('click', () => window.print());

  document.getElementById('stackCopyBtn').addEventListener('click', async () => {
    const text = buildStackSummary();
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('stackCopyBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Copied';
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    } catch (err) {
      alert('Copy failed. Try selecting and copying manually.');
    }
  });

  document.querySelectorAll('.progress-step').forEach((step, i) => {
    step.addEventListener('click', () => {
      const stepNum = i + 1;
      if (stepNum <= currentStep) {
        currentStep = stepNum;
        showStep(currentStep);
        restoreInputState();
      }
    });
  });

  updateNextButtons();
  showStep(0);
