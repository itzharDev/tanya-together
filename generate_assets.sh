filePath=lib/core/consts/assets.dart

rm -f $filePath &

icons=$(ls assets/icons)
images=$(ls assets/images)
videos=$(ls assets/videos)

array=($icons)
assets="class TanyaIcons {\n"
MYCUSTOMTAB='                           '
for element in ${icons}
do
    assets+="$MYCUSTOMTAB static const ${element%.*} = 'assets/icons/$element';\n"
done
assets+="}\n\n"

assets+="class TanyaImages {\n"
for element in ${images}
do
    assets+="$MYCUSTOMTAB static const ${element%.*} = 'assets/images/$element';\n"
done
assets+="}\n\n"

assets+="class TanyaVideos {\n"
for element in ${videos}
do
    assets+="$MYCUSTOMTAB static const ${element%.*} = 'assets/videos/$element';\n"
done
assets+="}"

echo $assets | tee $filePath