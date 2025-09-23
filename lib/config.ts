import {
  BookOpen,
  Code,
  Lightbulb,
  NotepadText,
  Paintbrush,
  Sparkle,
} from "lucide-react";

export const SUGGESTIONS = [
  {
    label: 'Operation',
    highlight: 'Operation',
    prompt: 'Operation',
    items: [
      'How do I start the RoboRail machine safely?',
      'What are the daily operation procedures?',
      'How do I calibrate the cutting head?',
      'What safety checks should I perform before operation?',
    ],
    icon: Sparkle,
  },
  {
    label: 'Troubleshooting',
    highlight: 'Troubleshooting',
    prompt: 'Troubleshooting',
    items: [
      'The machine is showing error code E001, what does this mean?',
      'The cutting quality is poor, what could be the issue?',
      'The machine stops unexpectedly during operation',
      'How do I diagnose hydraulic pressure problems?',
    ],
    icon: Code,
  },
  {
    label: 'Maintenance',
    highlight: 'Maintenance',
    prompt: 'Maintenance',
    items: [
      'What is the recommended maintenance schedule?',
      'How do I replace the cutting torch consumables?',
      'When should I check the hydraulic fluid levels?',
      'How do I clean and maintain the rail guides?',
    ],
    icon: NotepadText,
  },
  {
    label: 'Safety',
    highlight: 'Safety',
    prompt: 'Safety',
    items: [
      'What are the key safety protocols for RoboRail operation?',
      'How do I properly use personal protective equipment?',
      'What emergency procedures should I know?',
      'How do I safely handle cutting gases and materials?',
    ],
    icon: Lightbulb,
  },
  {
    label: 'Specifications',
    highlight: 'Specifications',
    prompt: 'Specifications',
    items: [
      'What are the technical specifications of the RoboRail?',
      'What materials can the RoboRail cut?',
      'What are the power requirements for operation?',
      'What cutting speeds and feeds should I use?',
    ],
    icon: BookOpen,
  },
  {
    label: 'Setup',
    highlight: 'Setup',
    prompt: 'Setup',
    items: [
      'How do I set up the RoboRail for a new job?',
      'How do I program cutting patterns?',
      'How do I adjust cutting parameters for different materials?',
      'How do I position the workpiece correctly?',
    ],
    icon: Paintbrush,
  },
];
