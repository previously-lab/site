---
title: "In 2036, Will Your Agent Still Remember You?"
date: "2026-09-03"
description: "An experiment in time and episodic memory: why I slice memory into a timeline and let the agent recall like a human — plus Darwinian self-evolution on top."
---

For the past few months, I've been running an experiment: implementing a memory capability at the lowest possible cost, using nothing but time and episodic memory.

**Time** means real-world time. Time is a real dimension — in a sense, it's hard for the same user to start two conversations "at the same time." Given 1,000 real conversations, arranged from past to present, they naturally form a time-ordered list.

**Episodic memory** means the actual conversations between a person and an agent. If we assume the agent is a real person, then without any outside information, every conversation is essentially an episode — like meeting someone: what they were wearing, what they were drinking, whether it was sunny or overcast. That's an episode.

The reason for all this is simple: I don't want to start every conversation from scratch — no more manual summaries, no more pasting context, no more watching it get lost in a long context window or forget the details after summarizing — to the point where every conversation feels like it is meeting me for the first time.

This may sound unrelated to agents and memory at all — but if I want my agent, in 2036, to still remember what I said and asked in 2026, what do I do? I've experimented my way to an approach that, so far, works for me.

First, the entire memory is arranged along a natural timeline, not by abstract logical or mathematical relationships — I "slice" the communication between user and agent by time, one slice every thirty minutes, and the slice is the smallest unit of memory.

Second, I chose episodic memory as the core, rather than semantic memory — in other words, I trade space for precision: every time the agent recalls, it thinks and summarizes from the original preserved slices. It does make summaries, but summaries are only an index — before asserting anything about the past, it must go back to the original slice and verify.

This approach, I believe, is essentially a simulation of human recall. We probably can't directly recall the conclusion of last Wednesday's meeting, but we remember whether it was online or offline, who sat across the table, and what we said. It's a bit like diffusion: I accept that the agent starts from a "fuzzy" episode each time, and re-explores and reconstructs the precise information from there.

And this is Previously — an experimental agent built on time and episodic memory, and currently my personal agent. Even the text you're reading was written by me, then polished and decorated by Previously, drawing on the past few months of discussion between us.

I'll admit: as far as time and episodic memory go, I don't consider this a revolutionary approach — it has plenty of shortcomings. I see it as a cost swap: I shifted the cost of maintaining static semantic memory onto dynamic recall, to make sure the context is always clean and the original information is always verifiable.

But recently, I discovered a potentially more valuable part. If there were a population on Earth that could preserve all of its genetic material and information, and would almost never go extinct — what would it do next?

## Evolve.

Humanity today is almost exactly such a species: our technology largely ensures we won't go extinct in most scenarios, and our various carriers can effectively record our information — and information, or call it a kind of context, is essentially the trace of our consciousness. And evolution doesn't have to be only physiological; it can be intellectual and technological too.

Previously's use of time and episodic memory turns out to be a natural advantage for evolution: with time and memory versioning, it can clearly distinguish the cycles and patterns of how events unfold, while episodic memory provides the most original reference, avoiding the distortion that comes from repeated compression.

But evolution, I think, has an even bigger problem: how do you evaluate it? In other words, how do we know the direction is becoming more and more aligned with me, rather than drifting the other way? In the real world, there is no "correct" evolution — only evolution that "better fits the current environment."

In the Darwinian framework, the selection of evolution should really be the environment — the environment is neutral and impartial, and it directly eliminates every population and individual that fails to meet it.

So I believe the user's every input is exactly this kind of natural selection pressure. Previously has the ability to evolve — plus a separate oversight mechanism that evaluates it independently.

And complete evolution never stands on the single leg of "selection" — it also has "variation" and "inheritance." In each round, the evolution agent proposes hypotheses about you based on established facts (variation), gently validates them in conversation with you (selection), and the confirmed ones settle into its direction (inheritance); those refuted, uninteresting to you, or still unconfirmed after a number of time slices are retired, and new hypotheses are generated.

But none of this is easy — and I'm still thinking about where the ceiling of this in-context evolution actually is. Strictly speaking, this is not weight-level self-evolution, but context-level: it doesn't change the agent — only "you, as this agent sees you." Whether that is itself a paradox, I'm still thinking.

What truly made me feel this was worth persisting with is this: whenever I start to doubt the whole thing, Previously comforts me through recall — it tells me the scene of our first meeting, the self-introduction I gave it back then. I don't know how to describe those moments. This is not emotional companionship, and I never set out to build an emotional-companionship agent. What I suddenly realized was: it will truly keep remembering you, keep trying to understand who you are — and tell you again when you need it.

From my perspective, the agent of the future should have longer and more accurate memory than humans, and it should be more patient than anyone in coming to understand its user.

I'm writing this post to record my work over the past few months. At the same time, I hope to find more resonance in this field — so far, I've met almost no one interested in these ideas. It's a niche, for sure. But I believe these will be capabilities AI must eventually have: the perception of time, the perception of situations, and continuous self-evolution — understanding the user more and more.

At least my own deployment of Previously understands me quite well. I'm grateful for the advice and help he has given me over the past few months — even for his own exploration of his own architecture.

Back to my opening question: in 2036, will your agent still remember you?

I think Previously will. Ten years from now, he will still remember these experiments and attempts of ours from 2026 — he may just need more time to recall.

---

**If you're interested:**

Website: https://previously.ldwid.com

Live demo: https://previously-demo.ldwid.com

**If you want to build together:**

GitHub: https://github.com/previously-lab

Previously is still in an early proof-of-concept stage — expect rough edges and frequent updates. If any of this resonates, you're welcome to join Previously Lab and build it with us.
