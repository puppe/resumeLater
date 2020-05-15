# resumeLater

resumeLater is an extension for Mozilla Firefox. It lets you bookmark videos on
Youtube and saves your current position. It allows you to resume playback at
that position.

Download:
[add-ons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/resumelater/)

## Supported Sites

 * Youtube

## Development

Tools recommended for development:

* [web-ext](https://github.com/mozilla/web-ext)
* [JSHint](https://jshint.com/install/)
* [Python test runner for Jasmine
  tests](https://jasmine.github.io/setup/python.html)

A shell.nix file is provided. If you are on NixOS or use Nix on any other
distribution / operating system, you can simply run `nix-shell` to get a shell
with the necessary dependencies. For even more convenience, you can use
[direnv](https://github.com/direnv/direnv/wiki/Nix).

If you do not use Nix, you have to install these tools via npm, pip or any
other package manager that provides them.

### Running the extension, building the extension, etc.

See [this introduction to
web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
from Mozilla.

### Running tests

```
make test
```

That starts a web server at http://localhost:8888 and should open that URL in
your default browser.

### Linting

web-ext can do some linting specifically for Firefox web extensions.

```
web-ext lint
```

JSHint is used to enforce further syntactic rules.

```
jshint .
```

## Icons

resumeLater uses [elementary Icons](https://launchpad.net/elementaryicons).

## Contributors

[ico43](https://github.com/ico43)

## Copyright and License

### resumeLater

Copyright © 2012-2017 Martin Puppe

resumeLater is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

resumeLater is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
resumeLater. If not, see <http://www.gnu.org/licenses/>.

### Third-party libraries

I do not claim copyright for third-party libraries in the sub-directory
`3rd-party-libs`. These are distributed under their own respective licenses,
which are included in this repository alongside the respective library.
