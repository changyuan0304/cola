import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Image as ImageIcon, Loader2, RotateCcw, Link as LinkIcon, Save, FileText, Trash2, X, FolderOpen, BookOpen, Eye, Upload, CheckCircle, XCircle } from 'lucide-react';

function ProductLocationStory() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewingArticles, setViewingArticles] = useState(null);  // 正在查看文章的設定
  const [showLibrary, setShowLibrary] = useState(false);  // 左側 Library 面板
  const [viewingArticle, setViewingArticle] = useState(null);  // 當前查看的單篇文章
  const [contentType, setContentType] = useState('product');  // 內容類型：product, travel, discussion

  // 表單數據
  const [formData, setFormData] = useState({
    productName: '',
    productInfo: '',
    productFeatures: '',
    characterSetting: '',
    articleCount: 1,  // 新增：生成篇數
    articleDirection: 'experience'  // 文章方向：experience, repeat, story, photo
  });

  // URL 輸入
  const [productUrl, setProductUrl] = useState('');

  // 儲存的設定列表
  const [savedSettings, setSavedSettings] = useState([]);
  const [settingName, setSettingName] = useState('');

  // AI 生成的結果
  const [generatedContent, setGeneratedContent] = useState('');
  const [locations, setLocations] = useState([]);
  const [images, setImages] = useState([]);

  // 所有已生成的文章列表
  const [generatedArticles, setGeneratedArticles] = useState([]);

  // CSV 上傳相關狀態
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 通知系統
  const [notifications, setNotifications] = useState([]);

  // 熱門行程相關狀態
  const [popularTours, setPopularTours] = useState([]);
  const [fetchingTours, setFetchingTours] = useState(false);
  const [showTours, setShowTours] = useState(false);

  // ==================== 新增：Step 1 整合設定 ====================
  const [step1Config, setStep1Config] = useState({
    // 1️⃣ 內容來源
    sourceType: 'manual',  // manual, url, tours, csv
    productUrl: '',
    productName: '',
    productInfo: '',
    productFeatures: '',

    // 2️⃣ 篩選器
    filter: {
      minPrice: 10000,
      maxPrice: 200000,
      minDays: 3,
      maxDays: 15,
      keywords: [],
      excludeKeywords: [],
      sortBy: 'price',
      enableFilter: false
    },

    // 3️⃣ Persona
    selectedPersonas: [],

    // 4️⃣ 語氣
    selectedTones: ['casual'],

    // 5️⃣ 生成設定
    versionsPerCombo: 3,
    characterSetting: '200-300',
    articleDirection: 'experience'
  });

  // Persona 列表（15 個完整人物設定）
  const [personas, setPersonas] = useState([
    {
      id: 'persona_1',
      name: '小資上班族 - 小美',
      age: 25,
      gender: '女',
      occupation: '行政助理',
      description: '精打細算的小資女生，喜歡找CP值高的旅遊方案，熱愛打卡拍照',
      travelStyle: '省錢、網美景點、週末小旅行',
      budget: '10000-30000',
      keywords: ['小資', 'CP值', '省錢', '打卡', '週末']
    },
    {
      id: 'persona_2',
      name: '科技宅男 - 阿傑',
      age: 28,
      gender: '男',
      occupation: '軟體工程師',
      description: '喜歡深度旅遊和科技體驗，偏好自由行，會做詳細功課',
      travelStyle: '自由行、科技景點、博物館、深度探索',
      budget: '30000-80000',
      keywords: ['自由行', '深度', '科技', '研究', '攻略']
    },
    {
      id: 'persona_3',
      name: '全職媽媽 - 雅婷',
      age: 35,
      gender: '女',
      occupation: '家庭主婦',
      description: '重視親子體驗和安全，喜歡適合全家出遊的行程',
      travelStyle: '親子友善、安全、教育意義、輕鬆行程',
      budget: '40000-100000',
      keywords: ['親子', '安全', '孩子', '家庭', '輕鬆']
    },
    {
      id: 'persona_4',
      name: '商務菁英 - 志明',
      age: 40,
      gender: '男',
      occupation: '企業經理',
      description: '時間有限但預算充足，追求高品質和效率的旅遊體驗',
      travelStyle: '商務艙、高級飯店、效率、品質',
      budget: '100000-300000',
      keywords: ['高級', '品質', '效率', '商務', '舒適']
    },
    {
      id: 'persona_5',
      name: '退休老師 - 麗華',
      age: 60,
      gender: '女',
      occupation: '退休教師',
      description: '時間充裕，喜歡文化深度旅遊，注重舒適和健康',
      travelStyle: '文化、歷史、舒適、慢遊',
      budget: '50000-120000',
      keywords: ['文化', '歷史', '慢遊', '舒適', '養生']
    },
    {
      id: 'persona_6',
      name: '創業青年 - 大衛',
      age: 30,
      gender: '男',
      occupation: '新創公司老闆',
      description: '工作繁忙但懂得享受，喜歡獨特體驗和靈感啟發',
      travelStyle: '獨特體驗、創新、靈感、工作與旅行結合',
      budget: '50000-150000',
      keywords: ['創新', '獨特', '靈感', '體驗', '時尚']
    },
    {
      id: 'persona_7',
      name: '大學生 - 小雨',
      age: 22,
      gender: '女',
      occupation: '大學在學中',
      description: '預算有限的學生族，喜歡背包客旅行和交朋友',
      travelStyle: '青年旅館、背包客、冒險、交友',
      budget: '5000-20000',
      keywords: ['學生', '便宜', '背包客', '冒險', '青春']
    },
    {
      id: 'persona_8',
      name: '護理師 - 佳玲',
      age: 32,
      gender: '女',
      occupation: '醫院護理人員',
      description: '工作辛苦，旅遊時想完全放鬆，偏好度假村和SPA',
      travelStyle: '度假村、SPA、放鬆、慢活',
      budget: '30000-70000',
      keywords: ['放鬆', 'SPA', '度假', '紓壓', '慢活']
    },
    {
      id: 'persona_9',
      name: '自由設計師 - 阿哲',
      age: 27,
      gender: '男',
      occupation: '平面設計接案者',
      description: '追求美感和創意，喜歡攝影和藝術相關旅遊',
      travelStyle: '藝術、攝影、設計、美食、咖啡',
      budget: '20000-60000',
      keywords: ['藝術', '攝影', '設計', '美學', '咖啡']
    },
    {
      id: 'persona_10',
      name: '銀髮紳士 - 王伯伯',
      age: 65,
      gender: '男',
      occupation: '退休公務員',
      description: '注重舒適和品質，喜歡郵輪和高品質團體旅遊',
      travelStyle: '郵輪、團體旅遊、舒適、經典路線',
      budget: '80000-200000',
      keywords: ['郵輪', '舒適', '經典', '品質', '悠閒']
    },
    {
      id: 'persona_11',
      name: '時尚網紅 - Chloe',
      age: 26,
      gender: '女',
      occupation: '社群媒體經營者',
      description: '追求時尚和話題性，需要美照和獨特打卡點',
      travelStyle: '網紅景點、時尚、打卡、質感',
      budget: '40000-100000',
      keywords: ['網美', '打卡', '時尚', 'IG', '話題']
    },
    {
      id: 'persona_12',
      name: '工程師爸爸 - 建華',
      age: 38,
      gender: '男',
      occupation: '科技業工程師',
      description: '帶著家人出遊，兼顧親子和自己的興趣',
      travelStyle: '親子、科技體驗、寓教於樂',
      budget: '60000-150000',
      keywords: ['親子', '科技', '教育', '家庭', '平衡']
    },
    {
      id: 'persona_13',
      name: '空服員 - 心怡',
      age: 29,
      gender: '女',
      occupation: '航空公司空服員',
      description: '見多識廣，喜歡深度和獨特的旅遊體驗',
      travelStyle: '深度旅遊、當地體驗、美食、文化',
      budget: '30000-80000',
      keywords: ['深度', '當地', '美食', '文化', '獨特']
    },
    {
      id: 'persona_14',
      name: '房仲業務 - 俊傑',
      age: 33,
      gender: '男',
      occupation: '房地產經紀人',
      description: '重視社交和人脈，喜歡高爾夫和商務結合的旅遊',
      travelStyle: '商務休閒、高爾夫、社交、品酒',
      budget: '80000-200000',
      keywords: ['商務', '社交', '高爾夫', '品味', '人脈']
    },
    {
      id: 'persona_15',
      name: '瑜伽教練 - 安琪',
      age: 31,
      gender: '女',
      occupation: '健身房瑜伽老師',
      description: '追求身心靈平衡，喜歡養生和自然的旅遊',
      travelStyle: '瑜伽靜修、自然、養生、有機',
      budget: '25000-70000',
      keywords: ['瑜伽', '養生', '自然', '健康', '靜修']
    }
  ]);

  // 語氣模板
  const toneTemplates = {
    casual: { name: '輕鬆分享', color: 'blue' },
    enthusiastic: { name: '熱情推薦', color: 'orange' },
    professional: { name: '專業分析', color: 'gray' },
    authentic: { name: '真誠建議', color: 'green' },
    humorous: { name: '幽默風趣', color: 'yellow' }
  };

  // 折疊狀態控制
  const [expandedSections, setExpandedSections] = useState({
    source: true,
    filter: false,
    persona: true,
    tone: true,
    settings: true
  });

  // 模態視窗狀態
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showCustomToneModal, setShowCustomToneModal] = useState(false);

  // ==================== 漢堡選單相關 ====================
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // main, personas, articles, tours

  // 簡化版設定
  const [simpleConfig, setSimpleConfig] = useState({
    sourceType: 'tours', // tours or custom
    selectedTour: null,  // 選中的行程
    selectedPersona: 'persona_1', // 預設選擇第一個 persona
    versionsCount: 3,
    wordCount: '200-300',
    customTitle: '',     // 自訂行程標題
    customDescription: '' // 自訂行程描述
  });

  // 通知系統函數
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type // success, error, warning, info
    };

    setNotifications(prev => [...prev, notification]);

    // 3 秒後自動移除
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // 載入儲存的設定列表
  useEffect(() => {
    const saved = localStorage.getItem('productLocationStorySettingsList');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        setSavedSettings(list);
      } catch (e) {
        console.error('載入設定列表失敗:', e);
      }
    }
  }, []);

  // 從 Supabase 載入文章列表
  const loadArticlesFromSupabase = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/product-location-story/articles`);
      const data = await response.json();

      if (data.success && data.articles) {
        // 轉換 Supabase 文章格式為前端格式
        const articles = data.articles.map(article => ({
          id: article.id,
          content: article.content,
          locations: article.locations || [],
          images: article.images || [],
          createdAt: article.created_at,
          contentType: article.content_type,
          status: article.status || 'generated'  // 預設為已生成
        }));
        setGeneratedArticles(articles);
        console.log(`從 Supabase 載入 ${articles.length} 篇文章`);
      }
    } catch (error) {
      console.error('載入文章失敗:', error);
    }
  };

  // 組件載入時獲取文章
  useEffect(() => {
    loadArticlesFromSupabase();
  }, []);

  // 刪除文章
  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('確定要刪除這篇文章嗎？此操作無法復原。')) {
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/product-location-story/articles/${articleId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // 從本地狀態移除
        setGeneratedArticles(prev => prev.filter(article => article.id !== articleId));
        showNotification('文章已刪除', 'success');
      } else {
        throw new Error(data.message || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除文章失敗:', error);
      showNotification(`刪除失敗：${error.message}`, 'error');
    }
  };

  // 更新文章狀態
  const handleUpdateArticleStatus = async (articleId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'generated' : 'published';

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/product-location-story/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        // 更新本地狀態
        setGeneratedArticles(prev =>
          prev.map(article =>
            article.id === articleId
              ? { ...article, status: newStatus }
              : article
          )
        );
      } else {
        throw new Error(data.message || '更新失敗');
      }
    } catch (error) {
      console.error('更新文章狀態失敗:', error);
      showNotification(`更新失敗：${error.message}`, 'error');
    }
  };

  // CSV 檔案選擇
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      showNotification('請選擇 CSV 檔案', 'warning');
      e.target.value = '';
    }
  };

  // 上傳 CSV 檔案
  const handleUploadCSV = async () => {
    if (!selectedFile) {
      showNotification('請先選擇 CSV 檔案', 'warning');
      return;
    }

    setUploading(true);
    setUploadResults(null);
    setShowUploadModal(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch(`${apiUrl}/api/csv-import/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadResults(data);
        // 重新載入文章列表
        await loadArticlesFromSupabase();
        showNotification(`成功匯入 ${data.processedCount} 篇文章！`, 'success');
      } else {
        throw new Error(data.message || '上傳失敗');
      }
    } catch (error) {
      console.error('CSV 上傳失敗:', error);
      showNotification(`上傳失敗: ${error.message}`, 'error');
      setUploadResults({
        success: false,
        message: error.message
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
      // 清空檔案輸入
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';
    }
  };

  // 爬取熱門行程
  const handleFetchPopularTours = async (forceRefresh = false) => {
    setFetchingTours(true);
    setShowTours(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';

      // 設定 120 秒 timeout（爬蟲需要約 60 秒）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(`${apiUrl}/api/product-location-story/fetch-popular-tours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceRefresh }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        // 合併易遊網和東南旅遊的行程
        const allTours = [
          ...(data.eztravel || []).map(tour => ({ ...tour, source: '易遊網' })),
          ...(data.settour || []).map(tour => ({ ...tour, source: '東南旅遊' }))
        ];
        setPopularTours(allTours);

        // 顯示資料來源訊息
        const source = data.fromCache ? '資料庫快取' : '重新爬取';
        console.log(`成功獲取 ${data.totalCount} 個熱門行程 (來源: ${source}, 易遊網: ${data.eztravel?.length || 0}, 東南旅遊: ${data.settour?.length || 0})`);

        if (forceRefresh) {
          showNotification(`重新爬取完成！共獲取 ${data.totalCount} 個熱門行程`, 'success');
        }
      } else {
        throw new Error(data.message || '獲取失敗');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('爬取超時（超過 2 分鐘）');
        showNotification('爬取超時，請稍後再試。這個操作通常需要約 1 分鐘。', 'error');
      } else {
        console.error('獲取熱門行程失敗:', error);
        showNotification(`獲取失敗: ${error.message}`, 'error');
      }
    } finally {
      setFetchingTours(false);
    }
  };

  // 簡易生成（新的主要生成流程）
  const handleSimpleGenerate = async () => {
    // 驗證必填欄位
    if (simpleConfig.sourceType === 'tours' && !simpleConfig.selectedTour) {
      showNotification('請選擇一個行程', 'warning');
      return;
    }

    if (!simpleConfig.selectedPersona) {
      showNotification('請選擇人物設定', 'warning');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';

      // 準備生成參數
      const selectedPersona = personas.find(p => p.id === simpleConfig.selectedPersona);
      const selectedTour = simpleConfig.selectedTour ? JSON.parse(simpleConfig.selectedTour) : null;

      // 檢查是否選擇了 persona
      if (!selectedPersona) {
        throw new Error('請選擇一個人物角色（Persona）');
      }

      // 組合文案生成參數
      let productName, productInfo, productFeatures, characterSetting;

      if (simpleConfig.sourceType === 'tours') {
        // 檢查是否選擇了行程
        if (!selectedTour) {
          throw new Error('請先選擇一個熱門行程');
        }
        // 使用熱門行程資料
        productName = selectedTour.name;
        productInfo = `目的地：${selectedTour.destination}\n類型：${selectedTour.type}\n亮點：${selectedTour.highlights}\n價格：${selectedTour.price}`;
        productFeatures = selectedTour.highlights;
      } else {
        // 檢查是否填寫了自訂內容
        if (!simpleConfig.customDescription || simpleConfig.customDescription.trim() === '') {
          throw new Error('請填寫自訂行程描述');
        }
        // 使用自訂內容
        productName = simpleConfig.customTitle || '旅遊推薦';
        productInfo = simpleConfig.customDescription;
        productFeatures = '';
      }

      characterSetting = `${selectedPersona.name}（${selectedPersona.age}歲，${selectedPersona.gender}，${selectedPersona.occupation}）\n${selectedPersona.description}\n喜好與關鍵字：${selectedPersona.keywords.join('、')}`;

      console.log('🎨 開始生成文章...');

      // Step 1: 生成文案
      const contentResponse = await fetch(`${apiUrl}/api/product-location-story/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productInfo,
          productFeatures,
          characterSetting,
          toneStyle: simpleConfig.toneStyle,
          wordCount: simpleConfig.wordCount
        })
      });

      const contentData = await contentResponse.json();

      if (!contentData.success) {
        throw new Error(contentData.message || '文案生成失敗');
      }

      const content = contentData.content;
      console.log('✅ 文案生成成功');

      // Step 2: 生成圖片並儲存到 Supabase
      console.log('🖼️  開始生成圖片...');

      const imageResponse = await fetch(`${apiUrl}/api/product-location-story/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType: 'product',
          formData: {
            productName,
            productInfo,
            characterSetting
          }
        })
      });

      const imageData = await imageResponse.json();

      if (!imageData.success) {
        throw new Error(imageData.message || '圖片生成失敗');
      }

      console.log('✅ 圖片生成成功');

      // Step 3: 更新狀態並顯示結果
      setGeneratedContent(content);
      setLocations(imageData.locations || []);
      setImages(imageData.images || []);

      // 重新載入文章庫
      await loadArticlesFromSupabase();

      // 切換到文章庫視圖
      setCurrentView('articles');

      showNotification(`文章生成成功！已自動儲存到文章庫，共生成 ${imageData.images?.length || 0} 張地點圖片`, 'success');

    } catch (error) {
      console.error('生成失敗:', error);
      showNotification(`生成失敗：${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 儲存新設定
  const handleSaveSettings = () => {
    if (!settingName.trim()) {
      showNotification('請輸入設定名稱', 'warning');
      return;
    }

    const newSetting = {
      id: Date.now(),
      name: settingName,
      data: formData,
      articles: generatedArticles,  // 儲存所有已生成的文章
      createdAt: new Date().toISOString()
    };

    const updatedList = [...savedSettings, newSetting];
    setSavedSettings(updatedList);
    localStorage.setItem('productLocationStorySettingsList', JSON.stringify(updatedList));

    setSettingName('');
    setShowSidebar(true);
    showNotification('設定已儲存！', 'success');
  };

  // 載入設定
  const handleLoadSetting = (setting) => {
    setFormData(setting.data);
    setGeneratedArticles(setting.articles || []);  // 載入已生成的文章
    setShowSidebar(false);
    showNotification(`已載入設定：${setting.name}`, 'success');
  };

  // 刪除設定
  const handleDeleteSetting = (id) => {
    if (!window.confirm('確定要刪除這個設定嗎？')) return;

    const updatedList = savedSettings.filter(s => s.id !== id);
    setSavedSettings(updatedList);
    localStorage.setItem('productLocationStorySettingsList', JSON.stringify(updatedList));
    showNotification('設定已刪除', 'success');
  };

  // 從網址爬取商品資訊
  const handleScrapeUrl = async () => {
    if (!productUrl) {
      showNotification('請輸入商品網址', 'warning');
      return;
    }

    setScrapingUrl(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';

      const response = await fetch(`${apiUrl}/api/product-location-story/scrape-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: productUrl })
      });

      const data = await response.json();

      if (data.success) {
        // 自動填入爬取的內容
        setFormData(prev => ({
          ...prev,
          productName: data.title || prev.productName,
          productInfo: data.content || prev.productInfo
        }));
        showNotification('網頁內容已載入！', 'success');
      } else {
        showNotification(data.message || '爬取失敗', 'error');
      }
    } catch (error) {
      console.error('爬取失敗:', error);
      showNotification('爬取失敗，請檢查網址是否正確', 'error');
    } finally {
      setScrapingUrl(false);
    }
  };

  // ==================== 新增：Step 1 整合功能的 Handler ====================

  // 儲存 Step1 設定組合
  const handleSaveStep1Config = () => {
    const configName = prompt('請輸入設定組合名稱：');
    if (!configName) return;

    const savedConfig = {
      id: Date.now(),
      name: configName,
      config: step1Config,
      createdAt: new Date().toISOString()
    };

    const savedConfigs = JSON.parse(localStorage.getItem('step1Configs') || '[]');
    savedConfigs.push(savedConfig);
    localStorage.setItem('step1Configs', JSON.stringify(savedConfigs));

    showNotification(`設定組合「${configName}」已儲存！`, 'success');
  };

  // AI 自動生成 Persona
  const handleAutoGeneratePersonas = async () => {
    if (!step1Config.productInfo) {
      showNotification('請先輸入商品資訊', 'warning');
      return;
    }

    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';

    try {
      const response = await fetch(`${apiUrl}/api/personas/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: step1Config.productInfo
        })
      });

      const data = await response.json();

      if (data.success && data.personas) {
        const newPersonas = data.personas.map(p => ({
          ...p,
          id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        setPersonas([...personas, ...newPersonas]);
        showNotification(`成功生成 ${newPersonas.length} 個 Persona！`, 'success');
      } else {
        throw new Error(data.message || '生成失敗');
      }
    } catch (error) {
      console.error('AI 生成 Persona 失敗:', error);
      showNotification(`生成失敗: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 開始批次生成（新版）
  const handleStartGeneration = async () => {
    if (step1Config.selectedPersonas.length === 0) {
      showNotification('請至少選擇一個 Persona', 'warning');
      return;
    }
    if (step1Config.selectedTones.length === 0) {
      showNotification('請至少選擇一個語氣風格', 'warning');
      return;
    }

    const totalArticles =
      step1Config.selectedPersonas.length *
      step1Config.selectedTones.length *
      step1Config.versionsPerCombo;

    if (!window.confirm(`即將生成 ${totalArticles} 篇文章，每篇配 5 張圖片。\n預計花費時間約 ${Math.ceil(totalArticles * 30 / 60)} 分鐘。\n\n確定要開始嗎？`)) {
      return;
    }

    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';

    try {
      const response = await fetch(`${apiUrl}/api/content/multi-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: step1Config.sourceType,
          productInfo: step1Config.productInfo,
          productName: step1Config.productName,
          productUrl: step1Config.productUrl,
          filter: step1Config.filter.enableFilter ? step1Config.filter : null,
          personaIds: step1Config.selectedPersonas,
          tones: step1Config.selectedTones,
          versionsPerCombo: step1Config.versionsPerCombo,
          characterSetting: step1Config.characterSetting,
          articleDirection: step1Config.articleDirection
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification(`成功生成 ${data.totalGenerated} 篇文章！`, 'success');
        await loadArticlesFromSupabase();
        setStep(2);
      } else {
        throw new Error(data.message || '生成失敗');
      }
    } catch (error) {
      console.error('批次生成失敗:', error);
      showNotification(`生成失敗: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: 批量生成文案+圖片
  const handleGenerateContent = async () => {
    setLoading(true);
    const articles = [];
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4001';

    try {
      const count = parseInt(formData.articleCount) || 1;

      for (let i = 0; i < count; i++) {
        console.log(`正在生成第 ${i + 1}/${count} 篇文章...`);

        // 1. 生成文案
        const contentResponse = await fetch(`${apiUrl}/api/product-location-story/generate-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, contentType })
        });

        const contentData = await contentResponse.json();
        if (!contentData.success) {
          showNotification(`第 ${i + 1} 篇文案生成失敗`, 'error');
          continue;
        }

        const content = contentData.content;

        // 2. 生成圖片並存入 Supabase
        const imageResponse = await fetch(`${apiUrl}/api/product-location-story/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            contentType,
            formData
          })
        });

        const imageData = await imageResponse.json();
        if (!imageData.success) {
          showNotification(`第 ${i + 1} 篇圖片生成失敗`, 'error');
          continue;
        }

        // 3. 儲存這篇文章
        articles.push({
          id: Date.now() + i,
          content,
          locations: imageData.locations || [],
          images: imageData.images || [],
          createdAt: new Date().toISOString()
        });

        console.log(`第 ${i + 1}/${count} 篇完成`);
      }

      if (articles.length > 0) {
        setGeneratedContent(articles[0].content);
        setLocations(articles[0].locations);
        setImages(articles[0].images);
        setStep(2);

        // 重新從 Supabase 載入所有文章
        await loadArticlesFromSupabase();

        setShowLibrary(true);  // 自動打開 Library
        showNotification(`成功生成 ${articles.length} 篇文章！點擊左側「文章庫」查看所有文章`, 'success');
      } else {
        showNotification('所有文章生成失敗，請重試', 'error');
      }
    } catch (error) {
      console.error('生成失敗:', error);
      showNotification('生成失敗，請稍後再試', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 從文案提取地點並生成圖片
  const handleGenerateImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/api/product-location-story/generate-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: generatedContent })
      });

      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
        setImages(data.images);
        setStep(3);
      } else {
        showNotification(data.message || '生成圖片失敗', 'error');
      }
    } catch (error) {
      console.error('生成圖片失敗:', error);
      showNotification('生成圖片失敗，請稍後再試', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setGeneratedContent('');
    setLocations([]);
    setImages([]);
    setGeneratedArticles([]);
    setFormData({
      productName: '',
      productInfo: '',
      productFeatures: '',
      articleCount: 1,
      characterSetting: ''
    });
  };


  return (
      <div className="min-h-screen bg-gray-50">
        {/* ==================== 通知系統 ==================== */}
        <div className="fixed top-4 left-4 z-[9999] space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in-left min-w-[300px] max-w-md ${
                notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : notification.type === 'error' ? (
                  <XCircle size={20} />
                ) : notification.type === 'warning' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-sm font-medium">
                {notification.message}
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* ==================== 頂部導航欄 ==================== */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* 漢堡選單按鈕 */}
              <button
                onClick={() => setShowSideMenu(!showSideMenu)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Logo */}


              {/* 佔位 */}
              <div className="w-10"></div>
            </div>
          </div>
        </header>

        {/* ==================== 側邊選單 ==================== */}
        {showSideMenu && (
          <>
            {/* 遮罩 */}
            <div
              onClick={() => setShowSideMenu(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            />

            {/* 選單內容 */}
            <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform">
              <div className="p-6">
                {/* 關閉按鈕 */}
                <button
                  onClick={() => setShowSideMenu(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>

                {/* 選單標題 */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8">選單</h2>

                {/* 選單項目 */}
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentView('main');
                      setShowSideMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentView === 'main'
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles size={20} />
                    <span>主畫面</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('personas');
                      setShowSideMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentView === 'personas'
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>人物設定庫</span>
                    <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                      {personas.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('articles');
                      setShowSideMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentView === 'articles'
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={20} />
                    <span>文章庫</span>
                    <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                      {generatedArticles.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('tours');
                      setShowSideMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentView === 'tours'
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                    <span>熱門行程</span>
                    <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                      {popularTours.length}
                    </span>
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}

        {/* ==================== 主內容區域 ==================== */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ========== 主畫面 ========== */}
          {currentView === 'main' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  內容生成器
                </h2>
                <p className="text-gray-600">
                  選擇行程來源、人物風格，快速生成旅遊推薦文章
                </p>
              </div>

              <div className="space-y-6">

                {/* 1. 選擇內容來源 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    選擇內容來源
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSimpleConfig({...simpleConfig, sourceType: 'tours'})}
                      className={`p-6 border-2 rounded-xl transition-all text-left ${
                        simpleConfig.sourceType === 'tours'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 mb-1">熱門行程</div>
                      <div className="text-sm text-gray-600">自動爬取旅遊網站熱門行程</div>
                    </button>

                    <button
                      onClick={() => setSimpleConfig({...simpleConfig, sourceType: 'custom'})}
                      className={`p-6 border-2 rounded-xl transition-all text-left ${
                        simpleConfig.sourceType === 'custom'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 mb-1">指定行程/活動</div>
                      <div className="text-sm text-gray-600">輸入網址或手動填寫</div>
                    </button>
                  </div>
                </div>

                {/* 2. 產品內容 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    產品內容
                  </label>

                  {simpleConfig.sourceType === 'tours' ? (
                    <div>
                      {popularTours.length === 0 ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-gray-600 mb-4">尚未爬取熱門行程</p>
                          <button
                            onClick={() => handleFetchPopularTours(false)}
                            disabled={fetchingTours}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                          >
                            {fetchingTours ? '爬取中（約需 1 分鐘）...' : '開始爬取熱門行程'}
                          </button>
                        </div>
                      ) : (
                        <select
                          value={simpleConfig.selectedTour || ''}
                          onChange={(e) => setSimpleConfig({...simpleConfig, selectedTour: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">請選擇行程...</option>
                          {popularTours.map((tour, idx) => (
                            <option key={idx} value={JSON.stringify(tour)}>
                              {tour.name} - {tour.destination} - {tour.price}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="輸入行程標題（選填）"
                        value={simpleConfig.customTitle || ''}
                        onChange={(e) => setSimpleConfig({...simpleConfig, customTitle: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        placeholder="填寫行程描述或活動內容（必填）&#10;例如：溫暖的家、千歲/桃園、行程包含..."
                        rows={4}
                        value={simpleConfig.customDescription || ''}
                        onChange={(e) => setSimpleConfig({...simpleConfig, customDescription: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* 3. 人物風格 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    人物風格
                  </label>
                  <select
                    value={simpleConfig.selectedPersona}
                    onChange={(e) => setSimpleConfig({...simpleConfig, selectedPersona: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ai">AI 自動選擇（推薦）</option>
                    <optgroup label="─────────────────">
                      {personas.map(persona => (
                        <option key={persona.id} value={persona.id}>
                          {persona.name} ({persona.age}歲 {persona.gender} {persona.occupation})
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {simpleConfig.selectedPersona === 'ai' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      AI 會根據行程特性自動選擇最適合的人物風格
                    </div>
                  )}
                </div>

                {/* 4. 生成設定 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    生成設定
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">生成版本數</label>
                      <select
                        value={simpleConfig.versionsCount}
                        onChange={(e) => setSimpleConfig({...simpleConfig, versionsCount: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="1">1 個版本</option>
                        <option value="3">3 個版本（推薦）</option>
                        <option value="5">5 個版本</option>
                        <option value="10">10 個版本</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">字數限制</label>
                      <select
                        value={simpleConfig.wordCount}
                        onChange={(e) => setSimpleConfig({...simpleConfig, wordCount: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="150-200">150-200 字（短文）</option>
                        <option value="200-300">200-300 字（推薦）</option>
                        <option value="300-400">300-400 字（詳細）</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 生成按鈕 */}
                <button
                  onClick={handleSimpleGenerate}
                  disabled={loading || (!simpleConfig.selectedTour && simpleConfig.sourceType === 'tours') || !simpleConfig.selectedPersona}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                      生成中...
                    </>
                  ) : (
                    '開始生成'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========== 人物設定庫 ========== */}
          {currentView === 'personas' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  人物設定庫
                </h2>
                <p className="text-gray-600">
                  共 {personas.length} 個人物設定，涵蓋不同年齡、性別、職業
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personas.map(persona => (
                  <div
                    key={persona.id}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {persona.name}
                      </h3>
                        <div className="flex gap-2 mb-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {persona.age}歲
                          </span>
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">
                            {persona.gender}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {persona.occupation}
                          </span>
                        </div>
                      <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
                      <div className="text-xs text-gray-500">
                        <div><strong>旅遊風格：</strong>{persona.travelStyle}</div>
                        <div><strong>預算範圍：</strong>NT$ {persona.budget}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== 文章庫 ========== */}
          {currentView === 'articles' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  文章庫
                </h2>
                <p className="text-gray-600">
                  已生成 {generatedArticles.length} 篇文章
                </p>
              </div>

              {generatedArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={64} className="mx-auto mb-4 opacity-50" />
                  <p>尚無已生成的文章</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedArticles.map((article, idx) => (
                    <div
                      key={article.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                    >
                      {/* 頂部資訊列 */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {generatedArticles.length - idx}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm">文章 #{generatedArticles.length - idx}</p>
                              <button
                                onClick={() => handleUpdateArticleStatus(article.id, article.status)}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                                  article.status === 'published'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {article.status === 'published' ? '已發布' : '已生成'}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(article.createdAt).toLocaleString('zh-TW', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="刪除文章"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* 文章內容 */}
                      <div className="mb-4">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                          {article.content}
                        </p>
                      </div>

                      {/* 圖片網格 */}
                      {article.images && article.images.length > 0 && (
                        <div className={`grid gap-2 mb-3 ${
                          article.images.length === 1 ? 'grid-cols-1' :
                          article.images.length === 2 ? 'grid-cols-2' :
                          'grid-cols-2'
                        }`}>
                          {article.images.map((image, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative rounded-lg overflow-hidden bg-gray-100 group"
                            >
                              <img
                                src={image.url}
                                alt={image.location}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-white text-xs font-medium truncate">
                                  {image.location}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 底部互動區域（模仿 Threads） */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-gray-500">
                          <button className="hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button className="hover:text-green-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{article.images?.length || 0} 圖</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{article.content?.length || 0} 字</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== 熱門行程 ========== */}
          {currentView === 'tours' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    熱門行程
                  </h2>
                  <p className="text-gray-600">
                    已爬取 {popularTours.length} 個熱門行程
                  </p>
                </div>
                <button
                  onClick={() => handleFetchPopularTours(true)}
                  disabled={fetchingTours}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {fetchingTours ? '爬取中...' : '重新爬取'}
                </button>
              </div>

              {popularTours.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4 text-lg">尚未爬取熱門行程</p>
                  <button
                    onClick={handleFetchPopularTours}
                    disabled={fetchingTours}
                    className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
                  >
                    {fetchingTours ? '爬取中（約需 1 分鐘）...' : '開始爬取'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {popularTours.map((tour, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-3">
                            {tour.name}
                          </h3>
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-semibold">目的地：</span>
                              <span>{tour.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-semibold">類型：</span>
                              <span>{tour.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-semibold">亮點：</span>
                              <span>{tour.highlights}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                              {tour.price}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              {tour.source}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSimpleConfig({
                              ...simpleConfig,
                              sourceType: 'tours',
                              selectedTour: JSON.stringify(tour)
                            });
                            setCurrentView('main');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap ml-4 h-fit"
                        >
                          使用此行程
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
  );
}

export default ProductLocationStory;
