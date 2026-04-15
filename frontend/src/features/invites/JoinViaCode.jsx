import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, ArrowRight } from "lucide-react";
import { joinViaCode } from "./inviteAPI";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const JoinViaCode = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        try {
            const { data } = await joinViaCode(code.trim());

            toast.success(data.detail || "Successfully joined!");

            // Navigate based on entity type returned by the API
            if (data.entity_type === "organization") {
                navigate(`/app/organizations/${data.entity_id}/teams`);
            } else if (data.entity_type === "team") {
                navigate(`/app/organizations/${data.org_id}/teams/${data.entity_id}`);
            } else if (data.entity_type === "project") {
                navigate(`/app/teams/${data.team_id}/projects/${data.entity_id}`);
            } else {
                navigate("/app/dashboard");
            }
        } catch (err) {
            toast.error(
                err.response?.data?.detail || "Invalid code or you are already a member."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 animate-fade-in">
            <div className="card p-8 bg-dark-800 border-dark-700">
                <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center mb-6">
                    <Rocket className="text-brand-400" size={24} />
                </div>

                <h1 className="text-2xl font-semibold text-dark-50 mb-2">
                    Join with a Code
                </h1>
                <p className="text-dark-400 mb-8">
                    Enter an invite code to join an organization, team, or project instantly.
                </p>

                <form onSubmit={handleJoin} className="space-y-6">
                    <Input
                        label="Invite Code"
                        placeholder="e.g. ORG-9XK3P"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        required
                        autoFocus
                    />

                    <Button
                        type="submit"
                        className="w-full justify-center"
                        loading={loading}
                        icon={ArrowRight}
                    >
                        Join Now
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default JoinViaCode;
