<script lang="ts">
    import { onMount } from "svelte";
    import { actions } from "astro:actions";
    import { language } from "../stores/languageStore"; // Import from the centralized store
    import { get } from "svelte/store"; // Import get to read store value outside component
    import { z } from "zod";
    import { foodSuggestionSchema } from "../lib/schemas";
    import { derived } from "svelte/store";

    type FoodSuggestion = z.infer<typeof foodSuggestionSchema>;

    export let mbti: string; // Receive MBTI type as prop

    let suggestionData: FoodSuggestion | null = null;
    let error: string | null = null;
    let isLoading = true;
    let selectedPurpose:
        | "energizing"
        | "relaxing"
        | "social"
        | "comfort"
        | null = null;
    let selectedTimeOption:
        | "morning"
        | "midday"
        | "evening"
        | "weekend"
        | null = null;
    let selectedMealType:
        | "breakfast"
        | "lunch"
        | "dinner"
        | "night_snack"
        | null = null;
    let filteredRecommendations: Array<{ food: string; drink: string }> = [];
    let selectedOptionType: "purpose" | "time" = "purpose"; // Default to purpose-based selection

    function selectPurpose(
        purpose: "energizing" | "relaxing" | "social" | "comfort",
    ) {
        selectedPurpose = purpose;
        selectedTimeOption = null; // Reset the other option type
        selectedOptionType = "purpose";
        filterRecommendations();
    }

    function selectTimeOption(
        option: "morning" | "midday" | "evening" | "weekend",
    ) {
        selectedTimeOption = option;
        selectedPurpose = null; // Reset the other option type
        selectedOptionType = "time";
        filterRecommendations();
    }

    function selectMealType(
        mealType: "breakfast" | "lunch" | "dinner" | "night_snack",
    ) {
        selectedMealType = mealType;
        filterRecommendations();
    }

    function toggleOptionType(type: "purpose" | "time") {
        selectedOptionType = type;
        // Reset selections when changing option type
        if (type === "purpose") {
            selectedTimeOption = null;
        } else {
            selectedPurpose = null;
        }
    }

    function getMealTypeTitle(
        mealType: "breakfast" | "lunch" | "dinner" | "night_snack",
    ): string {
        const titles = {
            en: {
                breakfast: "Breakfast Suggestions",
                lunch: "Lunch Suggestions",
                dinner: "Dinner Suggestions",
                night_snack: "Late-night Snack Suggestions",
            },
            zh: {
                breakfast: "早餐建議",
                lunch: "午餐建議",
                dinner: "晚餐建議",
                night_snack: "宵夜建議",
            },
        };
        return titles[$language]?.[mealType] || "Dietary Suggestions"; // Fallback
    }

    function filterRecommendations() {
        if (!suggestionData || !selectedMealType) return;

        // Get the suggestions for the selected meal type
        const mealSuggestions = suggestionData.suggestions[selectedMealType];

        // Handle Purpose-based filtering
        if (selectedPurpose === "energizing") {
            // For energizing purpose, filter suggestions that mention energizing keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasEnergizingPath =
                    suggestionData?.keywords.energizing_path.some((keyword) =>
                        suggestion.food.includes(keyword),
                    );
                return (
                    hasEnergizingPath ||
                    suggestion.food.toLowerCase().includes("energizing") ||
                    suggestion.food.toLowerCase().includes("spicy")
                );
            });
        } else if (selectedPurpose === "relaxing") {
            // For relaxing purpose, filter suggestions that mention relaxing keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasRelaxingPath =
                    suggestionData?.keywords.relaxing_path.some((keyword) =>
                        suggestion.food.includes(keyword),
                    );
                return (
                    hasRelaxingPath ||
                    suggestion.food.toLowerCase().includes("relaxing") ||
                    suggestion.food.toLowerCase().includes("soothing")
                );
            });
        } else if (selectedPurpose === "social") {
            // For social gathering purpose, filter suggestions that mention social keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasSocialPath = suggestionData?.keywords.social_path.some(
                    (keyword) => suggestion.food.includes(keyword),
                );
                return (
                    hasSocialPath ||
                    suggestion.food.toLowerCase().includes("sharing") ||
                    suggestion.food.toLowerCase().includes("gathering")
                );
            });
        } else if (selectedPurpose === "comfort") {
            // For comfort food purpose, filter suggestions that mention comfort keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasComfortPath =
                    suggestionData?.keywords.comfort_path.some((keyword) =>
                        suggestion.food.includes(keyword),
                    );
                return (
                    hasComfortPath ||
                    suggestion.food.toLowerCase().includes("comfort") ||
                    suggestion.food.toLowerCase().includes("traditional")
                );
            });
        }
        // Handle Time-based filtering
        else if (selectedTimeOption === "morning") {
            // For morning energy, filter suggestions that mention morning keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasMorningPath =
                    suggestionData?.keywords.morning_path.some((keyword) =>
                        suggestion.food.includes(keyword),
                    );
                return (
                    hasMorningPath ||
                    suggestion.food.toLowerCase().includes("morning") ||
                    suggestion.food.toLowerCase().includes("energy")
                );
            });
        } else if (selectedTimeOption === "midday") {
            // For midday focus, filter suggestions that mention midday keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasMiddayPath = suggestionData?.keywords.midday_path.some(
                    (keyword) => suggestion.food.includes(keyword),
                );
                return (
                    hasMiddayPath ||
                    suggestion.food.toLowerCase().includes("focus") ||
                    suggestion.food.toLowerCase().includes("midday")
                );
            });
        } else if (selectedTimeOption === "evening") {
            // For evening wind-down, filter suggestions that mention evening keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasEveningPath =
                    suggestionData?.keywords.evening_path.some((keyword) =>
                        suggestion.food.includes(keyword),
                    );
                return (
                    hasEveningPath ||
                    suggestion.food.toLowerCase().includes("evening") ||
                    suggestion.food.toLowerCase().includes("wind-down")
                );
            });
        } else if (selectedTimeOption === "weekend") {
            // For weekend indulgence, filter suggestions that mention weekend keywords
            filteredRecommendations = mealSuggestions.filter((suggestion) => {
                const hasWeekendPath =
                    suggestionData?.keywords.weekend_path.some((keyword) =>
                        suggestion.food.includes(keyword),
                    );
                return (
                    hasWeekendPath ||
                    suggestion.food.toLowerCase().includes("weekend") ||
                    suggestion.food.toLowerCase().includes("indulgence")
                );
            });
        }

        // If no suggestions match the filter criteria, show all for that meal type
        if (
            filteredRecommendations.length === 0 &&
            mealSuggestions.length > 0
        ) {
            console.warn(
                "Could not filter suggestions based on keywords, showing all for this meal type.",
            );
            filteredRecommendations = mealSuggestions;
        }
    }

    onMount(async () => {
        // Handle language changes directly
        language.subscribe(() => {
            isLoading = true;
            error = null;
            suggestionData = null;
            console.log("Language changed, refreshing suggestions");
            actions
                .getFoodSuggestion({
                    mbti: mbti,
                    origin: window.location.origin,
                    lang: get(language),
                })
                .then((result) => {
                    if (result.error) {
                        throw new Error(
                            result.error.message ||
                                "Failed to fetch suggestion data.",
                        );
                    }
                    suggestionData = result.data;
                    filterRecommendations();
                })
                .catch((err) => {
                    error = err.message;
                })
                .finally(() => {
                    isLoading = false;
                });
        });
        isLoading = true;
        error = null;
        try {
            // Read the current language from the store
            const lang = get(language);

            // Call the Astro Action, passing the language
            const result = await actions.getFoodSuggestion({
                mbti: mbti,
                origin: window.location.origin, // Provide the origin for the API call
                lang: lang, // Pass the current language
            });

            // Astro Actions return { data, error }
            if (result.error) {
                // ActionError has code and message
                throw new Error(
                    result.error.message || "Failed to fetch suggestion data.",
                );
            }

            suggestionData = result.data;
        } catch (e) {
            console.error("Error fetching suggestion:", e);
            error =
                e instanceof Error ? e.message : "An unknown error occurred.";
        } finally {
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <!-- Skeleton Loading State -->
    <div class="w-full max-w-4xl mx-auto">
        <!-- Analysis Card Skeleton -->
        <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm mb-6">
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1">
                    <!-- Title Skeleton -->
                    <div
                        class="h-8 bg-gray-200 rounded-md w-3/4 mb-6 animate-pulse"
                    ></div>

                    <!-- Analysis Section Skeleton -->
                    <div class="mb-6">
                        <div
                            class="h-6 bg-gray-200 rounded-md w-1/3 mb-3 animate-pulse"
                        ></div>
                        <div class="bg-gray-50 rounded-lg p-4 mb-3">
                            <div class="flex flex-wrap gap-2 mb-3">
                                <div
                                    class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"
                                ></div>
                                <div
                                    class="h-6 bg-gray-200 rounded-md w-24 animate-pulse"
                                ></div>
                                <div
                                    class="h-6 bg-gray-200 rounded-md w-16 animate-pulse"
                                ></div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <div
                                    class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"
                                ></div>
                                <div
                                    class="h-6 bg-gray-200 rounded-md w-28 animate-pulse"
                                ></div>
                                <div
                                    class="h-6 bg-gray-200 rounded-md w-16 animate-pulse"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Selection Card Skeleton -->
        <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm mb-6">
            <div
                class="h-6 bg-gray-200 rounded-md w-1/3 mb-4 animate-pulse"
            ></div>

            <!-- Approach Selection Skeleton -->
            <div class="mb-6">
                <div
                    class="h-5 bg-gray-200 rounded-md w-1/4 mb-3 animate-pulse"
                ></div>
                <div class="flex flex-wrap gap-3">
                    <div
                        class="h-12 bg-gray-100 rounded-lg w-32 animate-pulse"
                    ></div>
                    <div
                        class="h-12 bg-gray-100 rounded-lg w-32 animate-pulse"
                    ></div>
                </div>
            </div>

            <!-- Meal Type Selection Skeleton -->
            <div>
                <div
                    class="h-5 bg-gray-100 rounded-md w-1/4 mb-3 animate-pulse"
                ></div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div
                        class="h-20 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                    <div
                        class="h-20 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                    <div
                        class="h-20 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                    <div
                        class="h-20 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                </div>
            </div>
        </div>
    </div>
{:else if error}
    <!-- Error Display -->
    <div class="w-full max-w-4xl mx-auto">
        <div class="bg-white rounded-xl p-6 md:p-8 shadow-sm text-center">
            <div class="text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold mb-3 text-red-600">
                {$language === "en" ? "An Error Occurred" : "發生錯誤"}
            </h2>
            <p class="text-gray-700 font-medium">{error}</p>
            <button
                class="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all duration-300 shadow-sm"
                on:click={() => window.location.reload()}
            >
                {$language === "en" ? "Reload" : "重新載入"}
            </button>
        </div>
    </div>
{:else if suggestionData}
    <!-- Suggestion Display -->
    <div class="w-full max-w-4xl mx-auto">
        <!-- Analysis Card -->
        <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm mb-6">
            <div class="flex flex-col md:flex-row gap-6">
                <!-- Left Column: Analysis -->
                <div class="flex-1">
                    <div class="mb-6">
                        <h3
                            class="text-xl font-semibold mb-3 flex items-center text-gray-700"
                        >
                            <span class="text-gray-500 mr-2">📈</span>
                            {$language === "en"
                                ? "Personality Analysis"
                                : "性格分析"}
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-4 mb-3">
                            <p class="mb-3 flex items-start">
                                <span
                                    class="text-teal-700 font-semibold mr-2 flex-shrink-0"
                                    >💪🏼 {$language === "en"
                                        ? "Strengths:"
                                        : "優勢："}</span
                                >
                                <span class="flex flex-wrap gap-2">
                                    {#each suggestionData.analysis.strengths as strength}
                                        <span
                                            class="inline-block bg-teal-600/90 bg-opacity-60 px-3 py-1 rounded-md text-sm font-medium text-white shadow-sm"
                                            >{strength}</span
                                        >
                                    {/each}
                                </span>
                            </p>
                            <p class="flex items-start">
                                <span
                                    class="text-blue-700 font-semibold mr-2 flex-shrink-0"
                                    >🥱 {$language === "en"
                                        ? "Weaknesses:"
                                        : "劣勢："}</span
                                >
                                <span class="flex flex-wrap gap-2">
                                    {#each suggestionData.analysis.weaknesses as weakness}
                                        <span
                                            class="inline-block bg-blue-600 bg-opacity-60 px-3 py-1 rounded-md text-sm font-medium text-white shadow-sm"
                                            >{weakness}</span
                                        >
                                    {/each}
                                </span>
                            </p>
                        </div>
                    </div>

                    <!-- <div>
                        <h3 class="text-xl font-semibold mb-3 flex items-center text-gray-700">
                            <span class="text-gray-500 mr-2">🧭</span> {$language === 'en' ? 'Decision Path' : '決策路徑'}
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="mb-4">
                                <span class="text-teal-700 font-semibold block mb-2">▎{$language === 'en' ? 'Strength Application' : '優勢應用'}</span>
                                <div class="flex flex-wrap items-center justify-between">
                                    {#each suggestionData.keywords.strength_path as keyword, i}
                                        <div class="flex flex-1 items-center mb-2 mr-1">
                                            <span class="bg-teal-600/90 bg-opacity-60 {$language === 'zh' ? 'tracking-[0.2em]' : 'tracking-normal'} px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm [writing-mode:${$language === 'zh' ? 'vertical-lr' : 'horizontal-tb'}]">{keyword}</span>
                                            {#if i < suggestionData.keywords.strength_path.length - 1}
                                                <span class="mx-2 text-gray-500 flex-1 text-center">→</span>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            <div>
                                <span class="text-blue-700 font-semibold block mb-2">▎{$language === 'en' ? 'Weakness Balancing' : '劣勢平衡'}</span>
                                <div class="flex flex-wrap items-center">
                                    {#each suggestionData.keywords.weakness_path as keyword, i}
                                        <div class="flex flex-1 items-center mb-2 mr-1">
                                            <span class="bg-blue-600 bg-opacity-60 {$language === 'zh' ? 'tracking-[0.2em]' : 'tracking-normal'} px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm [writing-mode:${$language === 'zh' ? 'vertical-lr' : 'horizontal-tb'}]">{keyword}</span>
                                            {#if i < suggestionData.keywords.weakness_path.length - 1}
                                                <span class="mx-2 text-gray-500 flex-1 text-center">→</span>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
        </div>

        <!-- Selection Card -->
        <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm mb-6">
            <h3
                class="text-xl font-semibold mb-4 flex items-center text-gray-700"
            >
                <span class="text-gray-500 mr-2">🎨</span>
                {$language === "en" ? "Select Preferences" : "選擇偏好"}
            </h3>
            <p class="text-sm text-gray-500 mb-4">
                {$language === "en"
                    ? "Each meal comes with a paired drink recommendation."
                    : "每個餐點都配有一個配套飲品建議。"}
            </p>

            <!-- Option Type Toggle -->
            <div class="mb-4">
                <div
                    class="flex rounded-lg border border-gray-200 overflow-hidden"
                >
                    <button
                        on:click={() => toggleOptionType("purpose")}
                        class={`flex-1 py-2 px-4 font-medium text-center ${
                            selectedOptionType === "purpose"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {$language === "en" ? "By Purpose" : "按用餐目的"}
                    </button>
                    <button
                        on:click={() => toggleOptionType("time")}
                        class={`flex-1 py-2 px-4 font-medium text-center ${
                            selectedOptionType === "time"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {$language === "en" ? "By Time" : "按時間段"}
                    </button>
                </div>
            </div>

            {#if selectedOptionType === "purpose"}
                <!-- Dining Purpose Selection -->
                <div class="mb-6">
                    <h4 class="text-md font-medium mb-3 text-gray-600">
                        {$language === "en"
                            ? "Choose Purpose:"
                            : "選擇用餐目的："}
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            on:click={() => selectPurpose("energizing")}
                            class={`px-3 cursor-pointer py-3 rounded-lg font-medium transition-all duration-300 flex flex-wrap items-center justify-center ${
                                selectedPurpose === "energizing"
                                    ? "bg-orange-500 text-white shadow-sm"
                                    : "bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">⚡</span>
                            {$language === "en" ? "Energizing" : "提神活力"}
                        </button>
                        <button
                            on:click={() => selectPurpose("relaxing")}
                            class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap items-center justify-center ${
                                selectedPurpose === "relaxing"
                                    ? "bg-blue-500 text-white shadow-sm"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">🧘</span>
                            {$language === "en" ? "Relaxing" : "放鬆舒緩"}
                        </button>
                        <button
                            on:click={() => selectPurpose("social")}
                            class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap items-center justify-center ${
                                selectedPurpose === "social"
                                    ? "bg-green-500 text-white shadow-sm"
                                    : "bg-green-50 text-green-700 hover:bg-green-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">👥</span>
                            {$language === "en" ? "Social" : "社交聚會"}
                        </button>
                        <button
                            on:click={() => selectPurpose("comfort")}
                            class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap items-center justify-center ${
                                selectedPurpose === "comfort"
                                    ? "bg-purple-500 text-white shadow-sm"
                                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">🏠</span>
                            {$language === "en" ? "Comfort" : "心靈慰藉"}
                        </button>
                    </div>
                </div>
            {:else}
                <!-- Time-Based Selection -->
                <div class="mb-6">
                    <h4 class="text-md font-medium mb-3 text-gray-600">
                        {$language === "en" ? "Choose Time:" : "選擇時間段："}
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            on:click={() => selectTimeOption("morning")}
                            class={`px-3 cursor-pointer py-3 rounded-lg font-medium transition-all duration-300 flex flex-wrap flex-col items-center justify-center ${
                                selectedTimeOption === "morning"
                                    ? "bg-yellow-500 text-white shadow-sm"
                                    : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">🌅</span>
                            {$language === "en" ? "Morning Energy" : "早晨能量"}
                        </button>
                        <button
                            on:click={() => selectTimeOption("midday")}
                            class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap flex-col items-center justify-center ${
                                selectedTimeOption === "midday"
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "bg-red-50 text-red-700 hover:bg-red-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">☀️</span>
                            {$language === "en" ? "Midday Focus" : "中午專注"}
                        </button>
                        <button
                            on:click={() => selectTimeOption("evening")}
                            class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap flex-col items-center justify-center ${
                                selectedTimeOption === "evening"
                                    ? "bg-indigo-500 text-white shadow-sm"
                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">🌙</span>
                            {$language === "en"
                                ? "Evening Wind-down"
                                : "晚間放鬆"}
                        </button>
                        <button
                            on:click={() => selectTimeOption("weekend")}
                            class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap flex-col items-center justify-center ${
                                selectedTimeOption === "weekend"
                                    ? "bg-pink-500 text-white shadow-sm"
                                    : "bg-pink-50 text-pink-700 hover:bg-pink-100 shadow-sm"
                            }`}
                        >
                            <span class="mr-2 text-xl">🎉</span>
                            {$language === "en"
                                ? "Weekend Indulgence"
                                : "週末享受"}
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Meal Type Selection -->
            <div>
                <h4 class="text-md font-medium mb-3 text-gray-600">
                    {$language === "en" ? "Select Meal:" : "選擇餐點："}
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        on:click={() => selectMealType("breakfast")}
                        class={`relative cursor-pointer group overflow-hidden px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
                            selectedMealType === "breakfast"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm"
                        }`}
                    >
                        <div
                            class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        ></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍳</span>
                            <span class="font-medium"
                                >{$language === "en"
                                    ? "Breakfast"
                                    : "早餐"}</span
                            >
                            <div
                                class="particle"
                                style="width: 8px; height: 8px; top: 20%; left: 20%;"
                            ></div>
                            <div
                                class="particle"
                                style="width: 6px; height: 6px; top: 60%; left: 80%;"
                            ></div>
                        </div>
                    </button>
                    <button
                        on:click={() => selectMealType("lunch")}
                        class={`relative cursor-pointer group overflow-hidden px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
                            selectedMealType === "lunch"
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm"
                        }`}
                    >
                        <div
                            class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        ></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍱</span>
                            <span class="font-medium"
                                >{$language === "en" ? "Lunch" : "午餐"}</span
                            >
                            <div
                                class="particle"
                                style="width: 7px; height: 7px; top: 30%; left: 70%;"
                            ></div>
                            <div
                                class="particle"
                                style="width: 5px; height: 5px; top: 50%; left: 30%;"
                            ></div>
                        </div>
                    </button>
                    <button
                        on:click={() => selectMealType("dinner")}
                        class={`relative cursor-pointer group overflow-hidden px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
                            selectedMealType === "dinner"
                                ? "bg-cyan-500 text-white shadow-sm"
                                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 shadow-sm"
                        }`}
                    >
                        <div
                            class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        ></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍲</span>
                            <span class="font-medium"
                                >{$language === "en" ? "Dinner" : "晚餐"}</span
                            >
                            <div
                                class="particle"
                                style="width: 8px; height: 8px; top: 40%; left: 20%;"
                            ></div>
                            <div
                                class="particle"
                                style="width: 6px; height: 6px; top: 70%; left: 60%;"
                            ></div>
                        </div>
                    </button>
                    <button
                        on:click={() => selectMealType("night_snack")}
                        class={`relative cursor-pointer group overflow-hidden px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
                            selectedMealType === "night_snack"
                                ? "bg-purple-500 text-white shadow-sm"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-sm"
                        }`}
                    >
                        <div
                            class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        ></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍦</span>
                            <span class="font-medium"
                                >{$language === "en"
                                    ? "Late Snack"
                                    : "宵夜"}</span
                            >
                            <div
                                class="particle"
                                style="width: 7px; height: 7px; top: 25%; left: 75%;"
                            ></div>
                            <div
                                class="particle"
                                style="width: 5px; height: 5px; top: 65%; left: 25%;"
                            ></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Recommendations Section -->
        <div class="mb-6">
            {#if (selectedPurpose || selectedTimeOption) && selectedMealType}
                <div class="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                    <h3
                        class="text-xl font-semibold mb-4 flex items-center text-gray-700"
                    >
                        <span class="text-gray-500 mr-2">🛤️</span>
                        {getMealTypeTitle(selectedMealType)}
                        {#if selectedPurpose}
                            <span
                                class="ml-2 text-sm px-3 py-1 rounded-full shadow-sm"
                                class:bg-orange-100={selectedPurpose ===
                                    "energizing"}
                                class:text-orange-700={selectedPurpose ===
                                    "energizing"}
                                class:bg-blue-100={selectedPurpose ===
                                    "relaxing"}
                                class:text-blue-700={selectedPurpose ===
                                    "relaxing"}
                                class:bg-green-100={selectedPurpose ===
                                    "social"}
                                class:text-green-700={selectedPurpose ===
                                    "social"}
                                class:bg-purple-100={selectedPurpose ===
                                    "comfort"}
                                class:text-purple-700={selectedPurpose ===
                                    "comfort"}
                            >
                                {$language === "en"
                                    ? selectedPurpose === "energizing"
                                        ? "Energizing"
                                        : selectedPurpose === "relaxing"
                                          ? "Relaxing"
                                          : selectedPurpose === "social"
                                            ? "Social Gathering"
                                            : "Comfort Food"
                                    : selectedPurpose === "energizing"
                                      ? "提神活力"
                                      : selectedPurpose === "relaxing"
                                        ? "放鬆舒緩"
                                        : selectedPurpose === "social"
                                          ? "社交聚會"
                                          : "心靈慰藉"}
                            </span>
                        {:else if selectedTimeOption}
                            <span
                                class="ml-2 text-sm px-3 py-1 rounded-full shadow-sm"
                                class:bg-yellow-100={selectedTimeOption ===
                                    "morning"}
                                class:text-yellow-700={selectedTimeOption ===
                                    "morning"}
                                class:bg-red-100={selectedTimeOption ===
                                    "midday"}
                                class:text-red-700={selectedTimeOption ===
                                    "midday"}
                                class:bg-indigo-100={selectedTimeOption ===
                                    "evening"}
                                class:text-indigo-700={selectedTimeOption ===
                                    "evening"}
                                class:bg-pink-100={selectedTimeOption ===
                                    "weekend"}
                                class:text-pink-700={selectedTimeOption ===
                                    "weekend"}
                            >
                                {$language === "en"
                                    ? selectedTimeOption === "morning"
                                        ? "Morning Energy"
                                        : selectedTimeOption === "midday"
                                          ? "Midday Focus"
                                          : selectedTimeOption === "evening"
                                            ? "Evening Wind-down"
                                            : "Weekend Indulgence"
                                    : selectedTimeOption === "morning"
                                      ? "早晨能量"
                                      : selectedTimeOption === "midday"
                                        ? "中午專注"
                                        : selectedTimeOption === "evening"
                                          ? "晚間放鬆"
                                          : "週末享受"}
                            </span>
                        {/if}
                    </h3>

                    {#if filteredRecommendations.length > 0}
                        <div class="space-y-4">
                            {#each filteredRecommendations as suggestion, i}
                                <div
                                    class="bg-gray-50 rounded-lg p-4 transition-all duration-300 hover:bg-gray-100 shadow-sm"
                                >
                                    <div class="flex flex-col gap-2">
                                        <div class="flex items-start">
                                            <span
                                                class="text-gray-400 font-mono mr-3 text-lg"
                                            >
                                                {i ===
                                                filteredRecommendations.length -
                                                    1
                                                    ? "└"
                                                    : "├"}
                                            </span>
                                            <span
                                                class="text-gray-700 font-medium"
                                            >
                                                <span
                                                    class="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded mr-2 text-xs"
                                                >
                                                    {$language === "en"
                                                        ? "FOOD"
                                                        : "食物"}
                                                </span>
                                                {suggestion.food}
                                            </span>
                                        </div>
                                        <div class="flex items-start ml-6">
                                            <span
                                                class="text-gray-400 font-mono mr-3 text-lg"
                                            >
                                                {i ===
                                                filteredRecommendations.length -
                                                    1
                                                    ? " "
                                                    : "│"}
                                            </span>
                                            <span class="text-gray-700">
                                                <span
                                                    class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 text-xs"
                                                >
                                                    {$language === "en"
                                                        ? "DRINK"
                                                        : "飲品"}
                                                </span>
                                                {suggestion.drink}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="bg-gray-50 rounded-lg p-6 text-center">
                            <p class="text-gray-500">
                                {$language === "en"
                                    ? "No suggestions found for this focus."
                                    : "找不到適合此焦點的建議。"}
                            </p>
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="bg-white rounded-xl p-8 shadow-sm text-center">
                    {#if selectedPurpose || selectedTimeOption}
                        <p class="text-gray-600 font-medium text-lg">
                            {$language === "en"
                                ? "Please select a meal type to see suggestions"
                                : "請選擇一個餐點類型以查看建議"}
                        </p>
                    {:else if selectedMealType}
                        <p class="text-gray-600 font-medium text-lg">
                            {$language === "en"
                                ? selectedOptionType === "purpose"
                                    ? "Please select a dining purpose to see suggestions"
                                    : "Please select a time option to see suggestions"
                                : selectedOptionType === "purpose"
                                  ? "請選擇一個用餐目的以查看建議"
                                  : "請選擇一個時間段以查看建議"}
                        </p>
                    {:else}
                        <p class="text-gray-600 font-medium text-lg">
                            {$language === "en"
                                ? selectedOptionType === "purpose"
                                    ? "Please select a dining purpose and meal type to see suggestions"
                                    : "Please select a time option and meal type to see suggestions"
                                : selectedOptionType === "purpose"
                                  ? "請選擇用餐目的和餐點類型以查看建議"
                                  : "請選擇時間段和餐點類型以查看建議"}
                        </p>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    /* Card hover effects */
    .bg-white.bg-opacity-20 {
        transition: all 0.3s ease;
    }

    .bg-white.bg-opacity-20:hover {
        box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transform: translateY(-2px);
    }

    /* Animated particles for meal buttons */
    button .particle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        pointer-events: none;
        opacity: 0;
    }

    button:hover .particle {
        animation: float-particle 3s ease-in-out infinite;
    }

    /* Skeleton loading animation */
    .animate-pulse {
        animation: pulse 500ms cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 0.5;
        }
        50% {
            opacity: 0.2;
        }
    }

    @keyframes float-particle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        20% {
            opacity: 0.3;
        }
        50% {
            transform: translateY(-10px) translateX(5px);
            opacity: 0.5;
        }
        80% {
            opacity: 0.3;
        }
        100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
    }
</style>
