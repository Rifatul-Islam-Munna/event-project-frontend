// Import all decorative images
import AwardsPng from '@/images/decotaor/awards.png';
import BarPng from '@/images/decotaor/bar.png';
import BasicPlantPng from '@/images/decotaor/basic-plant.png';
import BasicTreePng from '@/images/decotaor/basic-tree.png';
import BuffetTablePng from '@/images/decotaor/buffet-table.png';
import CakePng from '@/images/decotaor/cake.png';
import CandelPng from '@/images/decotaor/candel.png';
import ChristmasTreePng from '@/images/decotaor/christmas-tree.png';
import CloseDoorPng from '@/images/decotaor/close-door.png';
import DanceFloorPng from '@/images/decotaor/dance-floor.png';
import DjBoothPng from '@/images/decotaor/dj-booth.png';
import EntrancePng from '@/images/decotaor/entrance.png';
import FlowerBasketPng from '@/images/decotaor/flower-buke.png';
import GiftTablePng from '@/images/decotaor/gift-table.png';
import OpenDoorPng from '@/images/decotaor/open-door.png';
import PianoPng from '@/images/decotaor/piano.png';
import PodiumPng from '@/images/decotaor/podium.png';
import PotPlantPng from '@/images/decotaor/pot-plant.png';
import ProjectorScreenPng from '@/images/decotaor/projeactor-screen.png';
import ProjectorPng from '@/images/decotaor/projector.png';
import SmallPlantPng from '@/images/decotaor/small-plant.png';
import SpeakerPng from '@/images/decotaor/speaker.png';
import StagePng from '@/images/decotaor/stage.png';
import {
  GripVertical,
  Palette,
  TreePine,
  Utensils,
  DoorClosed as Door,
  Volume2,
  Search,
} from "lucide-react";
const height = 150;
const width = 150;

export const decorativeCategories = {
  decor: {
    label: "Decor",
       icon: TreePine,
    items: [
      {
        id: 'basic-tree',
        label: 'Basic Tree',
        imageUrl: BasicTreePng,
        width,
        height,
      },
      {
        id: 'christmas-tree',
        label: 'Christmas Tree',
        imageUrl: ChristmasTreePng,
        width,
        height,
      },
      {
        id: 'basic-plant',
        label: 'Basic Plant',
        imageUrl: BasicPlantPng,
        width,
        height,
      },
      {
        id: 'pot-plant',
        label: 'Pot Plant',
        imageUrl: PotPlantPng,
       width,
        height,
      },
      {
        id: 'small-plant',
        label: 'Small Plant',
        imageUrl: SmallPlantPng,
        width,
        height,
      },
      {
        id: 'flower-basket',
        label: 'Flower Basket',
        imageUrl: FlowerBasketPng,
       width,
        height,
      },
      {
        id: 'candel',
        label: 'Candle',
        imageUrl: CandelPng,
        width,
        height,
      },
    ]
  },
  furniture: {
    label: "Furniture",
     icon: Utensils,
    items: [
      {
        id: 'cake',
        label: 'Cake Table',
        imageUrl: CakePng,
        width,
        height,
      },
      {
        id: 'buffet-table',
        label: 'Buffet Table',
        imageUrl: BuffetTablePng,
        width,
        height,
      },
      {
        id: 'bar',
        label: 'Bar',
        imageUrl: BarPng,
       width,
        height,
      },
      {
        id: 'gift-table',
        label: 'Gift Table',
        imageUrl: GiftTablePng,
       width,
        height,
      },
      {
        id: 'piano',
        label: 'Piano',
        imageUrl: PianoPng,
      width,
        height,
      },
      {
        id: 'podium',
        label: 'Podium',
        imageUrl: PodiumPng,
        width,
        height,
      },
      {
        id: 'awards',
        label: 'Award Stand',
        imageUrl: AwardsPng,
        width,
        height,
      },
    ]
  },
  entrance: {
    label: "Entrance & Doors",
    icon: Door,
    items: [
      {
        id: 'entrance',
        label: 'Entrance',
        imageUrl: EntrancePng,
         width,
        height,
      },
      {
        id: 'open-door',
        label: 'Open Door',
        imageUrl: OpenDoorPng,
        width,
        height,
      },
      {
        id: 'close-door',
        label: 'Closed Door',
        imageUrl: CloseDoorPng,
     width,
        height,
      },
    ]
  },
  audioVideo: {
    label: "Audio/Video",
      icon: Volume2,
    items: [
      {
        id: 'dj-booth',
        label: 'DJ Booth',
        imageUrl: DjBoothPng,
        width,
        height,
      },
      {
        id: 'speaker',
        label: 'Speaker',
        imageUrl: SpeakerPng,
        width,
        height,
      },
      {
        id: 'stage',
        label: 'Stage',
        imageUrl: StagePng,
      width,
        height,
      },
      {
        id: 'dance-floor',
        label: 'Dance Floor',
        imageUrl: DanceFloorPng,
        width,
        height,
      },
      {
        id: 'projector',
        label: 'Projector',
        imageUrl: ProjectorPng,
        width,
        height,
      },
      {
        id: 'projector-screen',
        label: 'Projector Screen',
        imageUrl: ProjectorScreenPng,
        width,
        height,
      },
    ]
  }
};


export const decorativeItems = [
  ...decorativeCategories.decor.items,
  ...decorativeCategories.furniture.items,
  ...decorativeCategories.entrance.items,
  ...decorativeCategories.audioVideo.items,
];
