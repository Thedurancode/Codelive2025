{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs-18_x
    pkgs.pnpm
    pkgs.git
    pkgs.docker-compose
    pkgs.bashInteractive
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
    echo "Codelive Assistant development shell ready"
  '';
}
