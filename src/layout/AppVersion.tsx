import { useEffect, useState } from "react";

function AppVersion() {
    const [version, setVersion] = useState("loading...");

    useEffect(() => {
        window.appInfo.getVersion().then(setVersion);
    }, []);

    return (
        <p className="text-sm text-gray-500 text-center mt-2">
            Version: {version}
        </p>
    );
}

export default AppVersion;
