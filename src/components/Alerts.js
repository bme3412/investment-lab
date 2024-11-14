// src/components/Alerts.js

'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import axios from 'axios';

const Alerts = () => {
    const [alertCriteria, setAlertCriteria] = useState({
        guidanceCut: '',
        ceoChange: false,
        turnaroundPlan: false,
    });

    const handleSaveAlert = async () => {
        await axios.post('/api/alerts', alertCriteria);
        // Add success handling
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Set Up Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Top-Line Guidance Cut Threshold</label>
                        <input
                            type="number"
                            value={alertCriteria.guidanceCut}
                            onChange={(e) => setAlertCriteria({ ...alertCriteria, guidanceCut: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., 5%"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={alertCriteria.ceoChange}
                            onChange={(e) => setAlertCriteria({ ...alertCriteria, ceoChange: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Notify on CEO Change
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={alertCriteria.turnaroundPlan}
                            onChange={(e) => setAlertCriteria({ ...alertCriteria, turnaroundPlan: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Notify on Turnaround Plan Announcement
                        </label>
                    </div>
                    <button
                        onClick={handleSaveAlert}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Save Alert
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Alerts;
