{pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    firefox-devedition-bin
    nodePackages.jshint
    nodePackages.web-ext
  ];
}