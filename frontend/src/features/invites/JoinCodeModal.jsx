import { useState } from "react";
import { joinViaCode } from "./inviteAPI";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Rocket } from "lucide-react";
import toast from "react-hot-toast";

const JoinCodeModal = ({ open, onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a join code");
      return;
    }

    setJoining(true);
    try {
      const response = await joinViaCode(code.trim());
      toast.success("Successfully joined!");
      if (onSuccess) onSuccess(response.data);
      setCode("");
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || "Invalid or expired join code";
      toast.error(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join with Code"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs text-dark-400 font-medium">
            Enter the unique code to join an Organization, Team, or Project.
          </p>
          <Input
            placeholder="e.g. ORG-9XK3P"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700 -mx-6 px-6">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={joining} icon={Rocket}>
            Join
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinCodeModal;
