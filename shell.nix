{pkgs ? import <nixpkgs> {}}: let
  python-packages = ps:
    with ps; [
      requests
      pip
      jupyter
      notebook
    ];
in
  pkgs.mkShell {
    # nativeBuildInputs is usually what you want -- tools you need to run
    nativeBuildInputs = with pkgs; [nodejs_18 (pkgs.python3.withPackages python-packages)];
  }
