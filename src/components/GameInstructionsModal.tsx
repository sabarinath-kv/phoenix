import { CommonInstructionsModal } from "./CommonInstructionsModal";

interface GameInstructionsModalProps {
  isOpen: boolean;
  onStartGame: () => void;
}

export const GameInstructionsModal = ({ isOpen, onStartGame }: GameInstructionsModalProps) => {
  const instructions = [
    {
      icon: "👀",
      text: "Look!",
      subtext: "I'll show you a face"
    },
    {
      icon: "😊",
      text: "Copy!",
      subtext: "Make the same face"
    }
  ];

  return (
    <CommonInstructionsModal
      isOpen={isOpen}
      title="Copy My Face"
      subtitle="Let's learn how to play"
      instructions={instructions}
      onStartGame={onStartGame}
      buttonText="LET'S START"
    />
  );
};