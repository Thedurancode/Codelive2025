{
  description = "Codelive Assistant development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        nodejs = pkgs.nodejs-18_x;

        nodePackages = (import ./packages {}).nodePackages;

      in {
        devShell = pkgs.mkShell {
          buildInputs = [
            nodejs
            pkgs.pnpm
            pkgs.git
            pkgs.docker-compose
            pkgs.bashInteractive
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"
            echo "Codelive Assistant development shell ready"
          '';
        };
      }
    );
}
