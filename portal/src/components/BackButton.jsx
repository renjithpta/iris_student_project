
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-6 bg-gray-300 px-6 py-3 rounded-[3rem] font-bold shadow"
    >
      ← Back to Menu
    </button>
  );
}
