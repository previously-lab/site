---
title: "Is Time the Missing Dimension in AI Memory?"
date: "2026-07-12"
description: "Maybe agents can anchor episodic memory in time to always remember — an argument for timelines over threads, and slices over summaries."
---

## What a Thread Cannot Hold

For over a year, I've been working with context and memory — mostly at the application layer, building on top of what the models give us. And from a certain angle, the thread paradigm makes perfect sense. A thread gives you a clean way to manage context. You can clear it when it gets noisy. You can compress it. You can copy it. As a developer, it's a straightforward abstraction.

But then I became a heavy user. Not just asking for code snippets — I was using agents to walk through life decisions, to analyze personal scenarios, to project outcomes across months of uncertainty. Long, winding threads about work, about family, about hobbies I'd been thinking about for years. And that's where the cracks started showing.

You know the moment. You've been discussing something in a single thread for weeks — a project, a relationship, a personal topic you've been working through. The thread has depth. It has history. And then one day it tells you the context is full. Or worse — it doesn't tell you anything. It just starts getting confused. Facts drift. Names blur. The thing you corrected three times last week is wrong again.

So you do the reasonable thing. You ask it to carefully compress everything you've discussed. You paste that summary into a new thread. You cross your fingers. And it sort of works — for a few turns. But something got lost in the compression. The agent forgot things it should have remembered. It mixed up who said what, or when something happened, or which event came first. Certain people and their relationships to each other got tangled. Certain outcomes got attributed to the wrong cause.

And it's not just about a single thread hitting its limit. There's a quieter, more common version of the same problem. Say I've been discussing a personal decision in one thread for days, and now I want to bring it up in a different thread — maybe with a different agent, maybe just in a new context. I can't. Most agents have no way to reach across threads. So I have to pause, ask the current agent to summarize everything relevant, copy that summary, paste it into the other thread, and hope the context carries over. Two threads. Manual bridging. Every time.

Here's the part that really got to me: correcting any of this didn't help. I'd remind it — "no, that happened in March, not January" — and it would get it right for the next three exchanges. Then it would drift again. The thread had been contaminated, and no amount of patching could clean it.

At some point I stopped troubleshooting and started wondering. If I had told a person all of this — the same discussions, the same details, the same history — they would remember. Not perfectly. Not verbatim. But they'd know the shape of it. They'd know the people, the timeline, the stakes. I would remember it myself.

So why can't an agent?

Or to ask it more precisely: what is the difference between how a thread holds context, and how an actual mind — human or otherwise — holds memory? What are we missing?

## The Way We Actually Remember

In 1972, the psychologist Endel Tulving drew a distinction that still cuts through most of what passes for "memory" in AI today. He called it episodic versus semantic memory.

Semantic memory is facts. Paris is the capital of France. Water freezes at 0 degrees Celsius. This is what LLMs are astonishingly good at — they've ingested the semantic memory of the entire internet.

Episodic memory is the memory of your life. The conversation you had yesterday. How it felt. What came before it and what came after. It's not a database lookup — it's a reconstruction. When you remember something, your brain doesn't replay a recording. It rebuilds the scene from fragments, anchored by cues: time, place, emotion, sequence.

If you take a rough inventory of the memory and context-management approaches available today — RAG pipelines, vector databases, structured knowledge stores — most of them, from where I sit, are essentially semantic memory systems. They are designed to record clean, bounded facts with precision. You tell your agent you started a new job on a particular day. You tell it your favorite fruit, or the kind of clothes you prefer to wear. And it does that well. These systems wrap each fact in a retrievable envelope, index it, and hand it back when the query matches. RAG and vector search have been battle-tested in production; they are effective, well-understood, and backed by a growing body of research. I am not arguing against them.

But they have never felt like enough. Here is why.

Say I spend two rounds of conversation — maybe a hundred words — describing what I ate for lunch. I talk about the restaurant, the person I was with, the way the food reminded me of somewhere I traveled years ago. An agent with a semantic memory system might dutifully record: "User had lunch. They ate at a restaurant." Technically correct. But it has thrown away everything that made that moment worth remembering. The tone, the texture, the associative thread that connected a meal to a memory of travel — all of it is gone. To a semantic system, those details look like noise. And perhaps they are, if your goal is to build a clean knowledge base. But if your goal is for the agent to understand you — to respond with something closer to empathy than to database retrieval — then those "noisy" details are the whole point. Without them, the agent's replies skew toward the rational and, in certain cases, confidently wrong, because it is missing the context that would have told it otherwise.

This is where episodic memory enters the picture. Think about an important meeting you attended. When someone brings it up later, what comes to mind? You probably do not recall a tidy set of minutes. You remember the room. The posture of the person across the table. The shape of the discussion — where it started, where it got stuck, where it finally turned. You might recall a fragment of what was decided, but not the exact wording. You recall a scene. And if you need more — the specific number, the precise commitment — you can reconstruct it by re-entering that scene in your mind. The scene is the retrieval key. The details follow.

This, I think, is the kind of memory most of us actually use most of the time. Not a semantic lookup against a personal database. A scene. An episode. Something anchored in a moment, carrying the texture of that moment with it.

And if memory is episodic by nature — if the primary unit is the scene, not the entry — then the next question follows naturally: what organizes these scenes? What is the spine they hang from?

Time. Every episode carries a timestamp. It does not need to be precise — "sometime last spring" is often enough — but it is almost never absent. When you search your own memory, the first question you ask is usually when. "When did we have that conversation?" From the when you navigate to the where and the what. Time is not a metadata field you attach after the fact. Time is the axis along which memory is already laid out.

I want to pause here and be careful: I am not claiming that semantic memory is irrelevant. It is clearly part of how we think. But it may not be the part we should build an agent's entire memory architecture around. What I am reaching toward is simpler, and also more unsettling: maybe the most natural way for an agent to remember you is not as a collection of extracted facts, but as a continuous timeline of episodes — scenes, threaded by time, each carrying enough texture to let the agent reconstruct what it needs to know.

There is a metaphor that finally made this click for me. A television show does not rely on you remembering every detail of previous seasons. It starts with a recap. "Previously on..." Three seconds. A handful of scenes. Enough context to make the next hour coherent. It does not try to compress the entire series into a vector. It just shows you what happened last time. And it works — every week, for millions of people.

What if AI memory worked the same way?

## Previously On You

Think about a textbook. If you took a biology textbook and reorganized its chapters by time — Monday: Chapter 1, Tuesday: Chapter 2, Wednesday: Chapter 3 — you would have made the book worse. The chapters are organized around concepts, not days. Splitting them by when they happen to be read misses the entire point of how the material is structured.

But your life is not a textbook. The events of your life are already organized by time. The meeting you attended, the conversation you had afterward, the thing you read on your phone during lunch — these happened in sequence, along a single axis. You did not experience them as a set of semantic categories to be filed under "work," "relationships," and "hobbies." You experienced them as a flow. Time was the spine.

So here is the idea. Instead of extracting entities from every conversation — linking this person to that project, this decision to that outcome — what if you simply stored each episode as it happened, in order, and let the timeline do the indexing? You would give up on building a detailed semantic map. In return, you would get something that costs almost nothing to maintain. You do not need to classify, reclassify, or re-index anything. The episode goes into the timeline. The timeline does not change. What happened, happened. The only work is recall.

And recall is surprisingly straightforward. Say you want to bring back the details of a meeting from a few days ago. In a semantic system, the agent has to first figure out which meeting you mean — matching against entity names, project tags, topic clusters — before it can recall anything. With a timeline, you just say "a few days ago." The agent walks backward along the axis, finds the rough window, and recalls whatever sits there. Broad scan first. Deep read second. You do not need the agent to know exactly what it is recalling before it starts to recall.

This points to a deeper shift in what the memory system is actually trying to do. In a semantic approach, the work is in the storage: you extract entities, classify relationships, deconstruct scenes into structured facts, and re-index them for retrieval. Every one of those steps risks losing something — the texture of a moment reduced to a probability distribution, a conversation flattened into a set of tagged topics. But an episodic slice is already complete. You do not need to break it apart to store it. The only hard problem is recall — reaching the right slice when you need it. Everything else is just keeping the file.

A memory system built around episodes and timelines asks a fundamentally different question than a memory system built around entities and embeddings. The semantic system asks: what can I extract? The episodic system asks: how do I find my way back?

This also changes what counts as context. In a thread-based system, context is something you carry — carefully compressed, pasted into new windows, guarded against overflow and contamination. In a timeline-based system, context is something you walk into. Each conversation starts by asking the agent to find its own footing: walk back along the timeline, recall the relevant episodes, read them. The context is assembled dynamically, on every request. It is never the same twice, because it is rebuilt from where you are standing right now.

This is an agentic approach to memory. You are not asking the model to hold everything in its context window. You are asking it to navigate. Walk the timeline. Recall what matters. Come back with what you need.

None of this requires a new kind of database. It just requires a different answer to the question: what is the primary unit of memory, and how should it be organized?

And here is where the name came from. If memory is a timeline of episodes — scenes, threaded by time, walked rather than searched — then every conversation with an agent should start the way a television drama picks up after a break. A recap. A handful of scenes from last time. Just enough to know where you are. Previously on you. That is the idea. The rest is implementation.

## Slices and Strands

The implementation, once you accept the premise, is almost straightforward. I have built it as an open-source project called Previously — [GitHub repo here](https://github.com/previously-lab/agent), with a live demo at [previously-demo.ldwid.com](https://previously-demo.ldwid.com).

**No threads.** With a timeline-based design, you do not actually need the concept of a "dialogue" at all. There is a single continuous timeline. Recall happens dynamically along that axis — the timeline itself is the only organizing structure. You do not isolate conversations into threads because the axis already gives you everything a thread was supposed to provide: separation by time.

**Slices.** A slice is an episode — a short, continuous span of conversation. In the current implementation, a slice is simply a Markdown file stored at `memory/episodic/slices/YYYY/MM/DD/HHMM.md`, where the timestamp is the first message. Thirty minutes of silence closes the slice automatically. That is the entire logic. Time does the cutting. I am not claiming this is the optimal way to define slice boundaries — there may be more elegant triggers, and I expect this will evolve. But the principle holds: episodes are bounded by time, not by topic.

**Strands.** If everything lives on a single timeline, how do you find conversations about the same thing across weeks or months? You could walk the timeline manually, but that does not scale. A strand is a thin cross-reference — keywords and concept tags extracted from each slice, stored in a single JSON file that maps each tag to the slices that carry it. Think of a project you have been discussing for half a year. There might be ten slices, spread across six months, each touching on that project from a different angle. Those ten slices form a strand. When the model detects you are discussing that project again, it can start from the strand — a pre-computed path through the timeline — rather than scanning blindly. Strands are index references, nothing more. They point to the slices. They do not duplicate them, compress them, or turn them into abstract representations. The timeline remains the single source of truth.

There is an open question I am still thinking about: could strands eventually replace semantic memory entirely? Could a rich enough web of cross-references across the timeline make a separate semantic store unnecessary? I do not know yet. But it is worth noting that semantic memory is not incompatible with this architecture. You could add a dedicated semantic layer — a knowledge graph, a vector index, structured fact storage — on top of slices and strands at any point, without breaking anything. The timeline does the heavy lifting. The rest is additive.

**Markdown on GitHub.** Every slice is a Markdown file with YAML frontmatter. Markdown because it is human-readable, model-agnostic, and likely to remain readable decades from now. GitHub because it gives you version control, access control, and recoverability for free. If a memory is accidentally overwritten or deleted, you can roll it back. Your context — the most valuable asset in any agent system — stays in your own repository, under your control. There is also an intriguing possibility around Git branching that I have not yet figured out how to use well for memory. Branches are one of Git's most powerful ideas, and I suspect there is something there. I am still exploring.

**Recall in two phases.** When a conversation starts, a fast, shallow pass scans recent slice summaries. This is closer to a conditioned reflex than to a search: broad, low-cost, allowed to be imperfect. It is the equivalent of glancing backward along the timeline to see what stands out. If it finds something, the second phase begins. A deeper, tool-calling pass reads the full content of the matched slices, walks the strands, and reconstructs enough context to begin the conversation. The two phases are coupled — breadth first, depth second — not two independent systems but two moments of a single recall process. One says look here. The other says now read this.

**Serverless.** I wanted the agent to be something you open a browser tab to reach — no client installation, no background daemon, no local setup unless you want it. The entire runtime lives within a Vercel request lifecycle: request comes in → read from GitHub → call the LLM → write back → done. GitHub as a storage layer makes this natural: the repo is always reachable, always in sync, and you never have to think about where your memory lives. For those who prefer local deployment, the same Markdown files work just as well on a local filesystem — no network dependency, no external service.

Time as the spine. Episodes as the content. Strands as the index. That is the whole thing.

## I'm Not Alone

I should be upfront: before I started this work, I was not paying close attention to what the research community had been doing in the first half of 2026. I was not following the latest papers on agent memory or temporal indexing. I simply felt — from the engineering, product, and business perspective — that something was off. An agent product that asks users to constantly open new chats, manually compress old ones, and mechanically memorize scattered facts about them is, at the level of experience, just a bad design. I started sketching a different architecture because the existing one frustrated me, not because I had a theory to prove.

So it was genuinely surprising, a few months in, to discover that 2026 had already produced a body of work circling around the same ideas.

On the core question — should time replace semantic similarity as the primary organizing dimension of memory? — several papers land in roughly the same place. TiMem (Findings of ACL 2026) treats temporal continuity as a first-class design principle, building a Temporal Memory Tree that organizes conversational history along a time axis rather than a topic map. MemForest (May 2026) takes a hierarchical approach to temporal indexing with MemTree, achieving a 6x throughput improvement over prior approaches with 79.8% accuracy on LongMemEval-S. The architecture is built around a single insight: organizing by time makes updates simpler and more predictable than organizing by semantic similarity. Cortex (April 2026) might be the closest published system to what I built — Markdown atoms, temporal stratification into hot, warm, and cold layers, zero embeddings, deployed in production.

On a related but distinct question — what kind of time are we even talking about? — Temporal Semantic Memory (Findings of ACL 2026) draws a line I had been circling but never articulated clearly: dialogue time versus occurrence time. The moment you discussed an event is not the same as the moment the event happened, and a memory system should know the difference.

But convergence means something. When multiple independent paths — some from academic labs, one from a person annoyed at having to open yet another blank chat window — arrive at the same counterintuitive direction, it is worth paying attention. Maybe the conclusion isn't counterintuitive at all. Maybe it is obvious, and we were all just overthinking it.

## Let's Find Out

I don't know if this is the right approach. Neither do the researchers behind Cortex or TiMem or any of the others. We're all exploring the same question: what does it mean for an AI to remember?

The honest answer is that we won't know until more people try it. More people build on it. More people pull it apart and find where it breaks.

I'm on X at [@likedreamwalker](https://x.com/likedreamwalker), and there's a [GitHub discussion board](https://github.com/previously-lab/agent/discussions) for the project. I read everything.

The question isn't whether AI can remember. It already can, in its way. The question is whether it can remember you — not your data, not your embeddings, but the shape of your life as it unfolds in time.

Maybe time is the dimension we've been missing. Let's find out.

---

*Originally published on [dev.to](https://dev.to/likedreamwalker/is-time-the-missing-dimension-in-ai-memory-2l9c).*
