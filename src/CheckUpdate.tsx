import React, { useEffect, useState } from 'react'

export default function CheckUpdate() {
    const [status, setStatus] = useState("idle");
    const [progress, setProgress] = useState(0);
    const showUpdater = ["available", "downloading", "downloaded"].includes(status);

    useEffect(() => {
        window?.updater?.onStatus(setStatus);
        window?.updater?.onProgress(setProgress);
    }, []);


    return (showUpdater ?

        <div className="fixed bottom-5 right-5 z-[9999]">
            <div className="bg-white rounded-xl shadow-xl p-3 w-52 text-center space-y-2">

                <button
                    onClick={() => {
                        if (status === "downloaded") {
                            window.updater.install();
                        } else {
                            window.updater.check();
                        }
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition
          ${status === "downloaded"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {status === "downloaded" ? "Install Update" : "Update Available"}
                </button>

                <p className="text-xs text-gray-600">
                    Status: <span className="font-medium">{status}</span>
                </p>

                {progress > 0 && (
                    <progress
                        value={progress}
                        max="100"
                        className="w-full h-2"
                    />
                )}
            </div>
        </div>
        : "")
}
