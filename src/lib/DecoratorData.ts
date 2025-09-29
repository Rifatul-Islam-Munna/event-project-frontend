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
import Band from '@/images/decotaor/band.png';
import PhotoBooth from '@/images/decotaor/Photo-Booth.png';
import KidsArea from '@/images/decotaor/Kids-area.png';
import Aisle from '@/images/decotaor/aisle.png';
import VanBar from '@/images/decotaor/Van-bar.png';
import Van from '@/images/decotaor/van.png';
import pool from '@/images/decotaor/pool.png';
import Church from '@/images/decotaor/Church.png';
import Fireworks from '@/images/decotaor/Fireworks.png';
import {
  GripVertical,
  Palette,
  TreePine,
  Utensils,
  DoorClosed as Door,
  Volume2,
  Search,
} from "lucide-react";
const height = 100;
const width = 100;

export const decorativeCategories = {
  decor: {
    label: "Decor",
       icon: TreePine,
    items: [
    
      {
        id: 'band-id',
        label: 'Band',
        imageUrl: Band,
        width,
        height,
      },
      {
        id: 'PhotoBooth-id',
        label: 'Photo Booth',
        imageUrl: PhotoBooth,
        width,
        height,
      },
      {
        id: 'KidsArea-id',
        label: 'Kids Area',
        imageUrl: KidsArea,
        width,
        height,
      },
      {
        id: 'Aisle-id',
        label: 'Aisle',
        imageUrl: Aisle,
        width,
        height,
      },
      {
        id: 'VanBar-id',
        label: 'Van Bar',
        imageUrl: VanBar,
        width,
        height,
      },
      {
        id: 'Van-id',
        label: 'Van',
        imageUrl: Van,
        width,
        height,
      },
      {
        id: 'pool-id',
        label: 'pool',
        imageUrl: pool,
        width,
        height,
      },
      {
        id: 'Church-id',
        label: 'Church',
        imageUrl: Church,
        width,
        height,
      },
      {
        id: 'Fireworks-id',
        label: 'Fireworks',
        imageUrl: Fireworks,
        width,
        height,
      },
      {
        id: 'flower-basket',
        label: 'Flowers',
        imageUrl: FlowerBasketPng,
       width,
        height,
      },
      {
        id: 'candel',
        label: 'Standing Lamp',
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
        label: 'Cake',
        imageUrl: CakePng,
        width,
        height,
      },
      {
        id: 'buffet-table',
        label: 'Live Cooking Station',
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
        label: 'Decoration Table',
        imageUrl: GiftTablePng,
       width,
        height,
      },
      {
        id: 'piano',
        label: 'Music Instruments',
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
     
    ]
  },
  entrance: {
    label: "Entrance & Doors",
    icon: Door,
    items: [
      {
        id: 'entrance',
        label: 'Main Entrance',
        imageUrl: EntrancePng,
         width,
        height,
      },
      {
        id: 'open-door',
        label: ' Door',
        imageUrl: OpenDoorPng,
        width,
        height,
      },
     /*  {
        id: 'close-door',
        label: 'Closed Door',
        imageUrl: CloseDoorPng,
     width,
        height,
      }, */
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
     /*  {
        id: 'projector-screen',
        label: 'Projector Screen',
        imageUrl: ProjectorScreenPng,
        width,
        height,
      }, */
    ]
  }
};


export const decorativeItems = [
  ...decorativeCategories.decor.items,
  ...decorativeCategories.furniture.items,
  ...decorativeCategories.entrance.items,
  ...decorativeCategories.audioVideo.items,
];
