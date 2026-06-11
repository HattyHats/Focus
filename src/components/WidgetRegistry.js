import NotesWidget from './widgets/NotesWidget';
import NewsWidget from './widgets/NewsWidget';
import StocksCryptoWidget from './widgets/StocksCryptoWidget';
import CalculatorWidget from './widgets/CalculatorWidget';
import CalendarWidget from './widgets/CalendarWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import TodoListWidget from './widgets/TodoListWidget';
import SpotifyWidget from './widgets/SpotifyWidget';
import WorldClockWidget from './widgets/WorldClockWidget';
import WeatherWidget from './widgets/WeatherWidget';
import BookmarksWidget from './widgets/BookmarksWidget';
import DictionaryWidget from './widgets/DictionaryWidget';
import WordCounterWidget from './widgets/WordCounterWidget';
import VisionBoardWidget from './widgets/VisionBoardWidget';
import CryptoHeatmapWidget from './widgets/CryptoHeatmapWidget';
import BlockchainVisualizerWidget from './widgets/BlockchainVisualizerWidget';
import AmbientWeatherWidget from './widgets/AmbientWeatherWidget';
import HattyMusicWidget from './widgets/HattyMusicWidget';
import EmbedWidget from './widgets/EmbedWidget';

// We will add new widgets here as we build them
export const WIDGET_TYPES = {
  NOTES: { id: 'NOTES', name: 'Notes', component: NotesWidget, defaultW: 4, defaultH: 4 },
  WORD_COUNTER: { id: 'WORD_COUNTER', name: 'Word Counter', component: WordCounterWidget, defaultW: 4, defaultH: 5 },
  CRYPTO_HEATMAP: { id: 'CRYPTO_HEATMAP', name: 'Crypto Heatmap', component: CryptoHeatmapWidget, defaultW: 6, defaultH: 6 },
  BLOCKCHAIN: { id: 'BLOCKCHAIN', name: 'Live Blockchain', component: BlockchainVisualizerWidget, defaultW: 4, defaultH: 5 },
  AMBIENT_WEATHER: { id: 'AMBIENT_WEATHER', name: 'Ambient Weather', component: AmbientWeatherWidget, defaultW: 4, defaultH: 4 },
  SPOTIFY: { id: 'SPOTIFY', name: 'Lofi Radio (Spotify)', component: SpotifyWidget, defaultW: 4, defaultH: 4 },
  HATTY: { id: 'HATTY', name: 'Chill With Hatty', component: HattyMusicWidget, defaultW: 4, defaultH: 4 },
  EMBED: { id: 'EMBED', name: 'Embed Website', component: EmbedWidget, defaultW: 4, defaultH: 6 },
  TODO: { id: 'TODO', name: 'To-Do List', component: TodoListWidget, defaultW: 4, defaultH: 4 },
  BOOKMARKS: { id: 'BOOKMARKS', name: 'Quick Bookmarks', component: BookmarksWidget, defaultW: 4, defaultH: 4 },
  DICTIONARY: { id: 'DICTIONARY', name: 'Dictionary', component: DictionaryWidget, defaultW: 4, defaultH: 5 },
  VISION: { id: 'VISION', name: 'Focus Image', component: VisionBoardWidget, defaultW: 4, defaultH: 4 },
  POMODORO: { id: 'POMODORO', name: 'Pomodoro Timer', component: PomodoroWidget, defaultW: 4, defaultH: 4 },
  WEATHER: { id: 'WEATHER', name: 'Weather', component: WeatherWidget, defaultW: 4, defaultH: 4 },
  NEWS_CRYPTO: { id: 'NEWS_CRYPTO', name: 'Crypto News', component: NewsWidget, defaultW: 4, defaultH: 6, props: { topic: 'crypto', title: 'Crypto News' } },
  NEWS_AI: { id: 'NEWS_AI', name: 'AI News', component: NewsWidget, defaultW: 4, defaultH: 6, props: { topic: 'ai', title: 'AI News' } },
  NEWS_POLITICS: { id: 'NEWS_POLITICS', name: 'Politics News', component: NewsWidget, defaultW: 4, defaultH: 6, props: { topic: 'politics', title: 'Politics News' } },
  MARKETS: { id: 'MARKETS', name: 'Markets (Live)', component: StocksCryptoWidget, defaultW: 4, defaultH: 4 },
  CLOCK: { id: 'CLOCK', name: 'World Clock', component: WorldClockWidget, defaultW: 4, defaultH: 4 },
  CALCULATOR: { id: 'CALCULATOR', name: 'Calculator', component: CalculatorWidget, defaultW: 4, defaultH: 4 },
  CALENDAR: { id: 'CALENDAR', name: 'Calendar', component: CalendarWidget, defaultW: 4, defaultH: 4 },
};

export const AVAILABLE_WIDGETS = Object.values(WIDGET_TYPES);
