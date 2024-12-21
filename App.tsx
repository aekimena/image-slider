import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: screenW } = Dimensions.get("window");

export default function App() {
  const [ListArr, setListArr] = useState([
    {
      color: "pink",
      image:
        "https://blog.ticketmaster.com/wp-content/uploads/2014/11/Marvel.png",
    },
    {
      color: "#ff0000",
      image:
        "https://as01.epimg.net/meristation/imagenes/2010/10/19/album/1287496200_496200_000001_album_normal.jpg",
    },
    {
      color: "blue",
      image: "https://freepngimg.com/thumb/thor/4-2-thor-png-picture.png",
    },
    {
      color: "black",
      image:
        "https://img.lum.dolimg.com/v1/images/open-uri20150608-27674-1stqv0r_bede4649.png?region=0%2C0%2C600%2C600",
    },
    {
      color: "brown",
      image:
        "https://i.pinimg.com/originals/74/24/5b/74245b9fa65b938701115b664ed5c5c8.png",
    },
    {
      color: "grey",
      image:
        "https://www.pngmart.com/files/22/Captain-America-The-Winter-Soldier-Movie-PNG-Isolated-HD-Pictures.png",
    },
    {
      color: "tomatoe",
      image:
        "https://e7.pngegg.com/pngimages/313/646/png-clipart-iron-man-illustration-iron-man-clint-barton-captain-america-marvel-cinematic-universe-film-ironman-heroes-avengers-thumbnail.png",
    },
  ]);

  const ROTATE_Z = useSharedValue(0);
  const TRANSLATE_X = useSharedValue(0);
  const OPACITY = useSharedValue(1);
  const M_BOTTOM = useSharedValue(15);
  const FIRST_M_BOTTOM = useSharedValue(15);
  const LIMIT_W = screenW / 2;

  const MAX_ROTATE = 20;

  const GESTURE_PAN = Gesture.Pan()
    .onUpdate((e) => {
      TRANSLATE_X.value = e.translationX;
      ROTATE_Z.value = interpolate(
        e.translationX,
        [-LIMIT_W, 0, LIMIT_W],
        [-MAX_ROTATE, 0, MAX_ROTATE]
      );
      OPACITY.value = interpolate(
        e.translationX,
        [-LIMIT_W, 0, LIMIT_W],
        [0.7, 1, 0.7]
      );
      M_BOTTOM.value = interpolate(
        e.translationX,
        [-LIMIT_W, 0, LIMIT_W],
        [0, 15, 0]
      );
      FIRST_M_BOTTOM.value = interpolate(
        e.translationX,
        [-LIMIT_W, 0, LIMIT_W],
        [0, 15, 0]
      );
    })
    .onEnd((e) => {
      if (Math.abs(TRANSLATE_X.value) > LIMIT_W) {
        // Animate the first item off-screen
        TRANSLATE_X.value = withTiming(
          e.translationX > 0 ? screenW : -screenW,
          { duration: 300 },
          () => {
            runOnJS(reorderList)();
          }
        );
      } else {
        // Reset animations
        TRANSLATE_X.value = withTiming(0, { duration: 200 });
        ROTATE_Z.value = withTiming(0, { duration: 200 });
        OPACITY.value = withTiming(1, { duration: 200 });
        M_BOTTOM.value = withTiming(15, { duration: 200 });
        FIRST_M_BOTTOM.value = withTiming(15, { duration: 200 });
      }
    })
    .runOnJS(true);

  const reorderList = () => {
    // Reset shared values for smooth transition
    const firstItem = ListArr[0];
    setListArr([...ListArr.slice(1), firstItem]);
    TRANSLATE_X.value = 0;
    ROTATE_Z.value = 0;
    OPACITY.value = 1;
    M_BOTTOM.value = withTiming(15, { duration: 200 });
    FIRST_M_BOTTOM.value = withTiming(15, { duration: 200 });
  };

  const slidingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${ROTATE_Z.value}deg` },
      { translateX: TRANSLATE_X.value },
    ],
    opacity: OPACITY.value,
    bottom: FIRST_M_BOTTOM.value,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <View style={styles.imagesCont}>
          {ListArr.slice(0, 3).map((item, index) => {
            const notSlidingStyle = useAnimatedStyle(() => ({
              bottom: index * 15 + M_BOTTOM.value,
            }));

            return (
              <GestureDetector gesture={GESTURE_PAN} key={index}>
                <Animated.Image
                  source={{ uri: item?.image }}
                  style={[
                    {
                      ...styles.content,
                      width: screenW * 0.9 - index * 15,
                      backgroundColor: item.color,

                      zIndex: ListArr.length - index,
                    },
                    index === 0 ? slidingStyle : notSlidingStyle,
                  ]}
                />
              </GestureDetector>
            );
          })}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  imagesCont: {
    alignItems: "center",
    height: 450,
    width: screenW,
  },
  content: {
    height: 450,
    position: "absolute",
    borderRadius: 20,
  },
});
