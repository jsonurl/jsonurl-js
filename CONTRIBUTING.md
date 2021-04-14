Contributing to jsonurl-js
======================
So you found a bug or want to contribute a new feature? Great! Before
you dig into the code there are some guidelines I need contributors to follow
so that I have a reasonable chance of keeping things organized without too much
effort.

Getting Started
---------------
+ Make sure you have a [GitHub account](https://github.com/signup/free).
+ If you just want to make a small change see "Making Trivial Changes" below.
+ If you're planning to implement a new feature it's a good idea to discuss
  it on [Zulip][zulip] first.
  This can help make sure you're not wasting your time on something that's 
  considered out of scope.
+ See if there is already an
  [issue](https://github.com/jsonurl/jsonurl-java/issues),
  or create a new one if necessary 
  + For defects, clearly describe the problem, including steps to reproduce
  + For features, clearly describe the idea, including intent, audience, and
    use cases
+ Fork the repository on GitHub.

Making and Submitting Changes
--------------
I accept pull requests via GitHub. [Zulip][zulip] is
the main channel of communication for contributors.  
Here are some guidelines which will make applying PRs easier for me:
+ Create a topic/feature branch from the `main` branch to base your work, and
  push your changes to a topic branch in your fork of the repository
+ Make commits of logical units and with [meaningful][commit-message-howto],
  [semantic][semantic-commit-message] messages that reference the related
  GitHub issue
+ Use the [style][eslintrc.js] of the existing codebase
+ Make sure you have added/updated tests for your changes, and that all tests
  pass
+ Submit a pull request once you're ready to merge

Making Trivial Changes
----------------------
For small changes, like tweaks to comments and/or documentation you don't need
to create an issue. A fork + PR with a proper commit message (i.e. doc: ...)
is sufficient.

[zulip]: https://jsonurl.zulipchat.com/#narrow/stream/248637-jsonurl-js
[eslintrc.js]: .eslintrc.js
[commit-message-howto]: https://chris.beams.io/posts/git-commit/
[semantic-commit-message]: https://seesparkbox.com/foundry/semantic_commit_messages

