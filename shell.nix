with import <nixpkgs> {};

# https://stackoverflow.com/questions/74742410/how-to-use-postgresql-in-nixos

stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        nodejs
        # postgresql_15
    ];

    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"
    '';

}
