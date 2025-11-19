"use client";

import { useState } from "react";
import { Dropzone } from "@/components/dropzone";

export default function UploadTestPage() {
	const [result, setResult] = useState<{ url: string; text: string } | null>(
		null,
	);

	return (
		<div className="min-h-screen bg-gray-50 p-8 font-sans">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">Doc Upload Test</h1>
					<p className="text-gray-500">
						Upload a PDF or TXT file to test the S3 upload and text extraction.
					</p>
				</div>

				<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
					<Dropzone onUploadComplete={setResult} />
				</div>

				{result && (
					<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-2">
								Upload Result
							</h2>
							<div className="p-4 bg-gray-50 rounded-lg border border-gray-200 break-all">
								<span className="font-mono text-sm text-gray-600">
									{result.url}
								</span>
							</div>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-2">
								Extracted Text Preview
							</h2>
							<div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
								<pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
									{result.text}
								</pre>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
