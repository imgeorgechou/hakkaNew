import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Play } from "lucide-react";

interface Item {
  name: string;
  hakkaChinese: string;
  hakkaPhonetics: string;
  english: string;
  imageUrl?: string;
  collected?: boolean;
  animate?: boolean;
}

interface DetectedObject {
  english: string;
  hakka: string;
  pronunciation: string;
  confidence: number;
}
const englishToChineseMap: { [key: string]: string } = {
  people: "人",
  chair: "椅子",

  book: "書",
  backpack: "背包",
  bag: "背包",
  umbrella: "雨傘",
  scissors: "剪刀",
  laptop: "電腦", // YOLO 可能用這個

  desk: "桌子",
  pencil: "鉛筆",
  pen: "筆",
  paper: "紙",
  ruler: "尺",
  phone: "手機",
  person: "人", // YOLO 有時會返回 'person' 而不是 'people'
};

const classroomItems: Item[] = [
  {
    name: "人",
    hakkaChinese: "人",
    hakkaPhonetics: "nginˇ",
    english: "people",
    collected: false,
  },
  {
    name: "凳仔",
    hakkaChinese: "椅子",
    hakkaPhonetics: "den eˋ",
    english: "chair",
    collected: false,
  },

  {
    name: "書",
    hakkaChinese: "書",
    hakkaPhonetics: "suˊ",
    english: "book",
    collected: false,
  },
  {
    name: "包袱",
    hakkaChinese: "背包",
    hakkaPhonetics: "bauˇ fu",
    english: "backpack",
    collected: false,
  },
  {
    name: "遮仔",
    hakkaChinese: "雨傘",
    hakkaPhonetics: "zaˊ eˋ",
    english: "umbrella",
    collected: false,
  },
  {
    name: "鉸刀",
    hakkaChinese: "剪刀",
    hakkaPhonetics: "gau doˊ",
    english: "scissors",
    collected: false,
  },
  {
    name: "電腦",
    hakkaChinese: "電腦",
    hakkaPhonetics: "tien noˋ",
    english: "laptop",
    collected: false,
  },
];

const audioMap: { [key: string]: string } = {
  人: "/audios/ngin.m4a",
  凳仔: "/audios/den-e.m4a",
  粉牌: "/audios/fun.m4a",
  書: "/audios/su.m4a",
  包袱: "/audios/bau-fug.m4a",
  遮仔: "/audios/za-e.m4a",
  鉸刀: "/audios/gau-do.m4a",
  電腦: "/audios/tien-no.m4a",
};

const HomeScreen: React.FC = () => {
  const [collectedItems, setCollectedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAllCollected, setIsAllCollected] = useState(false);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  useEffect(() => {
    // 檢查是否所有物品都被收集
    const allCollected = classroomItems.every((item) =>
      collectedItems.some((collected) => collected.english === item.english)
    );

    if (allCollected && !isAllCollected) {
      setIsAllCollected(true);
      setShowCompletionModal(true);
    }
  }, [collectedItems, isAllCollected]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/detect`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data: DetectedObject[] = await response.json();
      console.log("YOLO 辨識結果:", data);

      // 創建圖片 URL
      const imageUrl = URL.createObjectURL(file);

      // 去除重複的偵測結果
      const uniqueDetections = Array.from(
        new Set(data.map((obj) => obj.english))
      )
        .map((english) => data.find((obj) => obj.english === english)!)
        .filter((obj) => obj !== undefined);

      // 過濾已收集的物品，只添加新物品
      const newItems = uniqueDetections
        .map((obj) => ({
          name: obj.hakka,
          hakkaChinese: englishToChineseMap[obj.english] || obj.english,
          hakkaPhonetics: obj.pronunciation,
          english: obj.english,
          imageUrl: imageUrl,
          collected: true,
          animate: true, // 添加動畫標記
        }))
        .filter(
          (newItem) =>
            !collectedItems.some(
              (existingItem) => existingItem.name === newItem.name
            )
        );

      setCollectedItems((prev) => [...newItems, ...prev]);
    } catch (error) {
      console.error("Error detecting objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // 更新 handlePlayAudio
  const handlePlayAudio = (text: string) => {
    const audioPath = audioMap[text];
    if (audioPath) {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (isPlaying === text) {
          setIsPlaying(null);
          setCurrentAudio(null);
          return;
        }
      }

      const audio = new Audio(audioPath);
      audio.onended = () => {
        setIsPlaying(null);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      setIsPlaying(text);
      audio.play().catch((error) => {
        console.error("播放音檔失敗:", error);
        setIsPlaying(null);
        setCurrentAudio(null);
      });
    }
  };

  return (
    <div className="font-hakka bg-gradient-to-br from-green-100 to-blue-100 min-h-screen">
      {/* Header with Logo */}
      <header className="sticky top-0 left-0 right-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4 flex justify-center items-center py-4">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={200}
            height={60}
            priority
            className="h-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-8 p-4 sm:p-6 md:p-8 ">
        {/* 主題提示 */}
        <div className="text-center mb-6">
          <span className="inline-block bg-white px-6 py-2 rounded-full shadow-md text-gray-700 font-medium text-lg">
            目前主題：教室
          </span>
        </div>
        {/* 進度顯示 */}
        <div className="mb-4 bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">收集進度</span>
            <span className="text-green-600 font-medium">
              {collectedItems.length}/{classroomItems.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (collectedItems.length / classroomItems.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
        {/* 搜尋列 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              在教室找尋這些東西，點擊旁邊的相機來拍照！
            </h1>

            <label className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 cursor-pointer">
              <Camera size={24} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 待蒐集字卡 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            教室關卡 - 待蒐集字卡
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {classroomItems.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-4 shadow-md text-center ${
                  item.collected ? "bg-green-50" : ""
                }`}
              >
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.hakkaPhonetics}</p>
                <p className="text-sm text-gray-600">{item.hakkaChinese}</p>
                <p className="text-xs text-gray-400">{item.english}</p>
                {item.collected && (
                  <span className="text-green-500 text-sm">已收集!</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 已蒐集字卡 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            已蒐集 (蒐集過的只會辨識一次呦)
          </h2>
          <div className="space-y-4">
            {collectedItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-md flex items-center"
              >
                {/* 左側圖片 */}
                {item.imageUrl && (
                  <div className="mr-4 relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                )}

                {/* 右側文字內容 */}
                <div className="flex-grow">
                  <h3 className="font-bold text-xl">{item.name}</h3>
                  <p className="text-md text-gray-600">{item.hakkaPhonetics}</p>
                  <p className="text-md text-gray-600">{item.hakkaChinese}</p>
                  <p className="text-sm text-gray-400">{item.english}</p>
                </div>

                {/* 播放按鈕 */}
                <button
                  onClick={() => handlePlayAudio(item.name)}
                  className={`
                    ml-4 p-2 rounded-full transition-all transform
                    ${
                      isPlaying === item.name
                        ? "bg-blue-500 text-white scale-110 animate-pulse"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105"
                    }
                    active:scale-95
                  `}
                >
                  <Play
                    size={20}
                    className={`
                      transform transition-transform
                      ${isPlaying === item.name ? "animate-spin-slow" : ""}
                    `}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* 收集完成提示 */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  🎉 恭喜完成教室關卡！
                </h2>
                <p className="text-gray-600">
                  你已經成功收集了所有教室相關的客語單字！
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-lg font-medium">獲得成就：</p>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-yellow-700">🏆 教室探險大師</p>
                </div>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
                >
                  太棒了！
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 載入中提示 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <p>正在努力辨識OuO..</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
