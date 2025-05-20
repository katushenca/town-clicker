const UpgradeService = (() => {
    const API_ENDPOINT = '/api/upgrade/get';
    async function getUpgrade() {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true };
            }

            const errorText = await response.text();
            return { success: false, message: errorText || `Ошибка ${response.status}` };

        } catch (error) {
            console.error('UpgradeService.getUpgrade error:', error);
            return { success: false, message: error.message };
        }
    }
    return { getUpgrade };
})();

document.addEventListener('DOMContentLoaded', () => {
    async function requestUpgrade() {
        const result = await UpgradeService.getUpgrade();
    }
    requestUpgrade();
    setInterval(requestUpgrade, 60 * 1000);
});
