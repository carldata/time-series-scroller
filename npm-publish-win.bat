REM rebuilds webpack package
rmdir build /Q /S
tsc --jsx react --outDir build --declaration --preserveSymlinks --pretty