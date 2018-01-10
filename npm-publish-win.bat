REM rebuilds webpack package
rmdir build /Q /S
tsc --jsx react --outDir build --declaration --preserveSymlinks --pretty
copy src\hp-slider\style.css build\src\hp-slider /Y