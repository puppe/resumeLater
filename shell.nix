{pkgs ? import <nixpkgs> {} }:
let

  jasmine-core = pkgs.python3.pkgs.buildPythonPackage rec {
    pname = "jasmine-core";
    version = "3.5.0";

    src = pkgs.python3.pkgs.fetchPypi {
      inherit pname version;
      sha256 = "0kr92mfa56f1wj54nz59a9hl1ck0dr84rqr5j1zqy5abxhz7xjqw";
    };

    propagatedBuildInputs = with pkgs.python3.pkgs; [
      glob2
      ordereddict
    ];

    meta = with pkgs.lib; {
      homepage = http://jasmine.github.io/;
      description = "Jasmine is a Behavior Driven Development testing " +
        "framework for JavaScript. It does not rely on browsers, DOM, " +
        "or any JavaScript framework. Thus it's suited for websites, " +
        "Node.js (http://nodejs.org) projects, or anywhere that " +
        "JavaScript can run.";
      license = licenses.mit;
    };
  };

  jasmine = pkgs.python3.pkgs.buildPythonPackage rec {
    pname = "jasmine";
    version = "3.5.0";

    src = pkgs.python3.pkgs.fetchPypi {
      inherit pname version;
      sha256 = "0xlfbzqd48smcj8xr8lxil0j56fx1j9q58xcj34cz19wbi04mr0h";
    };

    propagatedBuildInputs = with pkgs.python3.pkgs; [
      cherrypy
      jasmine-core
      jinja2
      mock
      pyyaml
      selenium
      requests
    ];

    meta = with pkgs.lib; {
      homepage = http://jasmine.github.io/;
      description = "Jasmine is a Behavior Driven Development testing " +
        "framework for JavaScript. It does not rely on browsers, DOM, " +
        "or any JavaScript framework. Thus it's suited for websites, " +
        "Node.js (http://nodejs.org) projects, or anywhere that " +
        "JavaScript can run.";
      license = licenses.mit;
    };
  };

in

  pkgs.mkShell {
    buildInputs = with pkgs; [
      firefox-devedition-bin
      nodePackages.jshint
      nodePackages.web-ext
      (python3.withPackages(ps: [ jasmine ]))
    ];
  }