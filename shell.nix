{pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    firefox-devedition-bin
    nodePackages.web-ext
  ];
}