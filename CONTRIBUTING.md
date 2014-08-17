# Contributing to Spludo

## Accessing the Source

The latest development version of spludo is available at the
[spludo git repository][spludo-git-repository]:

  [spludo-git-repository]: http://github.com/DracoBlue/spludo/commits/master

    git clone git://github.com/DracoBlue/spludo.git

Spludo is currently developed against *node.JS 0.10*.

You may find the latest version of spludo also as [.zip/.tar][tar-zip-download].

 [tar-zip-download]: http://github.com/DracoBlue/spludo/archives/master


## Mailing List

There is a new mailing list available at [spludo@googlegroups.com][spludo-mailing-list]
([Archive][spludo-mailing-list])
  [spludo-mailing-list]: http://groups.google.com/group/spludo

## Issue Tracker

There is an issue tracker at <http://github.com/DracoBlue/spludo/issues>.

## How to Contribute

If you want to contribute, you are welcome! Please be sure to follow and
understand the [coding standards].

Before you start to develop a new core
feature ask on the [mailing list][spludo-mailing-list] for input and if the
feature is wanted. There is also an [issue tracker][spludo-issue-tracker].

  [spludo-issue-tracker]: http://github.com/DracoBlue/spludo/issues
  [coding standards]: CODINGSTANDARDS.md

### 1. Clean checkout

    $ git clone git://github.com/DracoBlue/spludo.git
    $ cd spludo

### 2. Applying changes

Now make your changes.

### 3. Testing the code

Then check if tests run and code is lint against the [coding standards]:

    $ cd spludotests
    $ ant core-test core-lint

### 4. Creating the patch

Now create a patch:

    $ git commit -m "Good summary of what your patch does"
    $ git format-patch HEAD^

### 5. Sending the patch

If you want to submit a patch, please send it to the
[mailing list][spludo-mailing-list] by linking to a [gists][gist-github]
post or as file attachment.

  [gist-github]: http://gist.github.com/
