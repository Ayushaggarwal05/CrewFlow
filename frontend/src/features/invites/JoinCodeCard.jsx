import { useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import toast from "react-hot-toast";
import { generateOrgCode, generateTeamCode, generateProjectCode } from "./inviteAPI";
import Button from "../../components/ui/Button";

const JoinCodeCard = ({ entityType, entityId, parentEntityId, initialCode }) => {
  const [code, setCode] = useState(initialCode || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState(entityType === "organizations" ? "DEVELOPER" : "MEMBER");

  const orgRoles = [
    { value: "ADMIN", label: "Admin" },
    { value: "MANAGER", label: "Manager" },
    { value: "DEVELOPER", label: "Developer" },
  ];

  const teamRoles = [
    { value: "LEAD", label: "Lead" },
    { value: "MEMBER", label: "Member" },
  ];

  const roles = entityType === "organizations" ? orgRoles : teamRoles;

  // If no code is provided, we don't have permission to see/manage it.
  if (!initialCode) return null;



  const handleRegenerate = async () => {
    if (!window.confirm(`Action will grant "${role}" role to joiners. Are you sure? Old codes will stop working.`)) return;

    setLoading(true);
    try {
      let res;
      if (entityType === "organizations") {
        res = await generateOrgCode(entityId, role);
      } else if (entityType === "teams") {
        res = await generateTeamCode(parentEntityId, entityId, role);
      } else if (entityType === "projects") {
        res = await generateProjectCode(parentEntityId, entityId, role);
      }


      if (res && res.data) {
        setCode(res.data.join_code);
        toast.success("Code regenerated!");
      }
    } catch (err) {
      toast.error("Failed to regenerate code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-5 bg-dark-800 border border-dark-700">
      <h3 className="font-semibold text-dark-50 mb-1">Invite Code</h3>
      <p className="text-sm text-dark-400 mb-4">
        Users can join using this code without needing an invitation.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 flex items-center justify-between">
            <span className="font-mono text-dark-100 tracking-wider">
              {code || "No code available"}
            </span>
            {code && (
              <button
                onClick={handleCopy}
                className="text-dark-400 hover:text-brand-400 transition-colors"
                title="Copy code"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
          </div>

          <div className="w-40">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-brand-500 transition-colors"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} Role
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={handleRegenerate}
          className="w-full justify-center"
          loading={loading}
          icon={RefreshCw}
        >
          Regenerate Join Code
        </Button>
      </div>

    </div>
  );
};

export default JoinCodeCard;
