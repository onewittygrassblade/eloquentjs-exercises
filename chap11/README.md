# Chapter 11 - Asynchronous programming

## Crow Tech

I have broken down the code from the book for this chapter, with few modifications, into several steps in order to play with the different implementation. These steps build on top of the previous one and can be found in the `step-by-step` folder:
- v1: introduce concept in its simplest form (callbacks, no error handling, no timeouts, no random failures).
- v2: add error handling and allow promise-based interfaces.
- v3: add random failure.
- v4: network flooding.
- v5: improved network flooding.
- v6: modify storage reading to never fail; this allows easier implementation of remote storage finding.

The code at the root is a slightly modified final version.

## Generators

Just a modification of the `Group` implmentation from chapter 6, using a generator to implement iteration.
