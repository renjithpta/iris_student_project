import { useNavigate, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  

  const logout = () => {
  localStorage.removeItem("token");
  navigate("/");
};

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 space-y-6">

        <h2 className="text-2xl font-black mb-8">
          🏛 Election Portal
        </h2>

        <nav className="space-y-4">
          <button onClick={()=>navigate("/official")}
            className="block w-full text-left hover:bg-blue-700 p-2 rounded">
            Dashboard
          </button>

          <button onClick={()=>navigate("/official/register")}
            className="block w-full text-left hover:bg-blue-700 p-2 rounded">
            Register Voter
          </button>

          <button onClick={()=>navigate("/official/create-election")}
            className="block w-full text-left hover:bg-blue-700 p-2 rounded">
            Create Election
          </button>

          <button onClick={()=>navigate("/official/election-dashboard")}
            className="block w-full text-left hover:bg-blue-700 p-2 rounded">
            Election Dashboard
          </button>

          <button onClick={()=>navigate("/official/voter-list")}
            className="block w-full text-left hover:bg-blue-700 p-2 rounded">
            Registered Voters
          </button>
        </nav>

      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Election Commission Control Panel
          </h1>

          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>

      </div>

    </div>
  );
}