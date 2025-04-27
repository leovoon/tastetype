<script lang="ts">
    import { onMount } from "svelte";
    import { actions } from "astro:actions";
    import { language } from '../stores/languageStore'; // Import from the centralized store
    import { get } from 'svelte/store'; // Import get to read store value outside component
    import { z } from "zod";
    import { foodSuggestionSchema } from "../lib/schemas";
    import { derived } from 'svelte/store';

    type FoodSuggestion = z.infer<typeof foodSuggestionSchema>;

    export let mbti: string; // Receive MBTI type as prop

    let suggestionData: FoodSuggestion | null = null;
    let error: string | null = null;
    let isLoading = true;
    let selectedApproach: "strengths" | "weaknesses" | null = null;
    let selectedMealType: "breakfast" | "lunch" | "dinner" | "night_snack" | null = null;
    let filteredRecommendations: string[] = [];


    function selectApproach(approach: "strengths" | "weaknesses") {
        selectedApproach = approach;
        filterRecommendations();
    }

    function selectMealType(mealType: "breakfast" | "lunch" | "dinner" | "night_snack") {
        selectedMealType = mealType;
        filterRecommendations();
    }

    function getMealTypeTitle(mealType: "breakfast" | "lunch" | "dinner" | "night_snack"): string {
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
            }
        };
        return titles[$language]?.[mealType] || "Dietary Suggestions"; // Fallback
    }

    function filterRecommendations() {
        if (!suggestionData || !selectedMealType) return;

        // Get the suggestions for the selected meal type
        const mealSuggestions = suggestionData.suggestions[selectedMealType];

        if (selectedApproach === "strengths") {
            // For strengths approach, filter suggestions that mention strength keywords
            filteredRecommendations = mealSuggestions.filter(suggestion => {
                const hasStrengthKeyword = suggestionData?.analysis.strengths.some(strength =>
                    suggestion.includes(strength));
                const hasStrengthPath = suggestionData?.keywords.strength_path.some(keyword =>
                    suggestion.includes(keyword));
                return hasStrengthKeyword || hasStrengthPath;
            });
        } else if (selectedApproach === "weaknesses") {
            // For weaknesses approach, filter suggestions that mention weakness keywords
            filteredRecommendations = mealSuggestions.filter(suggestion => {
                const hasWeaknessKeyword = suggestionData?.analysis.weaknesses.some(weakness =>
                    suggestion.includes(weakness));
                const hasWeaknessPath = suggestionData?.keywords.weakness_path.some(keyword =>
                    suggestion.includes(keyword));
                return hasWeaknessKeyword || hasWeaknessPath;
            });
        }

        // If no suggestions match the filter criteria, show all for that meal type
        if (filteredRecommendations.length === 0 && mealSuggestions.length > 0) {
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
            console.log('Language changed, refreshing suggestions');
            actions.getFoodSuggestion({
                mbti: mbti,
                origin: window.location.origin,
                lang: get(language)
            }).then(result => {
                if(result.error) {
                    throw new Error(result.error.message || "Failed to fetch suggestion data.");
                }
                suggestionData = result.data;
                filterRecommendations();
            }).catch(err => {
                error = err.message;
            }).finally(() => {
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
                lang: lang // Pass the current language
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
                    <div class="h-8 bg-gray-200 rounded-md w-3/4 mb-6 animate-pulse"></div>

                    <!-- Analysis Section Skeleton -->
                    <div class="mb-6">
                        <div class="h-6 bg-gray-200 rounded-md w-1/3 mb-3 animate-pulse"></div>
                        <div class="bg-gray-50 rounded-lg p-4 mb-3">
                            <div class="flex flex-wrap gap-2 mb-3">
                                <div class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                                <div class="h-6 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                                <div class="h-6 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <div class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                                <div class="h-6 bg-gray-200 rounded-md w-28 animate-pulse"></div>
                                <div class="h-6 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Decision Path Skeleton -->
                    <div>
                        <div class="h-6 bg-gray-200 rounded-md w-1/3 mb-3 animate-pulse"></div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="mb-4">
                                <div class="h-5 bg-gray-200 rounded-md w-1/4 mb-2 animate-pulse"></div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <div class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                                    <div class="h-6 bg-gray-200 rounded-md w-6 animate-pulse"></div>
                                    <div class="h-6 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <div class="h-5 bg-gray-200 rounded-md w-1/4 mb-2 animate-pulse"></div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <div class="h-6 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                                    <div class="h-6 bg-gray-200 rounded-md w-6 animate-pulse"></div>
                                    <div class="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Selection Card Skeleton -->
        <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm mb-6">
            <div class="h-6 bg-gray-200 rounded-md w-1/3 mb-4 animate-pulse"></div>

            <!-- Approach Selection Skeleton -->
            <div class="mb-6">
                <div class="h-5 bg-gray-200 rounded-md w-1/4 mb-3 animate-pulse"></div>
                <div class="flex flex-wrap gap-3">
                    <div class="h-12 bg-gray-100 rounded-lg w-32 animate-pulse"></div>
                    <div class="h-12 bg-gray-100 rounded-lg w-32 animate-pulse"></div>
                </div>
            </div>

            <!-- Meal Type Selection Skeleton -->
            <div>
                <div class="h-5 bg-gray-100 rounded-md w-1/4 mb-3 animate-pulse"></div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div class="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div class="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div class="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
{:else if error}
    <!-- Error Display -->
    <div class="w-full max-w-4xl mx-auto">
        <div class="bg-white rounded-xl p-6 md:p-8 shadow-sm text-center">
            <div class="text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold mb-3 text-red-600">{$language === 'en' ? 'An Error Occurred' : '發生錯誤'}</h2>
            <p class="text-gray-700 font-medium">{error}</p>
            <button
                class="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all duration-300 shadow-sm"
                on:click={() => window.location.reload()}
            >
                {$language === 'en' ? 'Reload' : '重新載入'}
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
                        <h3 class="text-xl font-semibold mb-3 flex items-center text-gray-700">
                            <span class="text-gray-500 mr-2">📈</span> {$language === 'en' ? 'Personality Analysis' : '性格分析'}
                        </h3>
                        <div class="bg-gray-50 rounded-lg p-4 mb-3">
                            <p class="mb-3 flex items-start">
                                <span class="text-teal-700 font-semibold mr-2 flex-shrink-0">💪🏼 {$language === 'en' ? 'Strengths:' : '優勢：'}</span>
                                <span class="flex flex-wrap gap-2">
                                    {#each suggestionData.analysis.strengths as strength}
                                        <span class="inline-block bg-teal-600/90 bg-opacity-60 px-3 py-1 rounded-md text-sm font-medium text-white shadow-sm">{strength}</span>
                                    {/each}
                                </span>
                            </p>
                            <p class="flex items-start">
                                <span class="text-blue-700 font-semibold mr-2 flex-shrink-0">🥱 {$language === 'en' ? 'Weaknesses:' : '劣勢：'}</span>
                                <span class="flex flex-wrap gap-2">
                                    {#each suggestionData.analysis.weaknesses as weakness}
                                        <span class="inline-block bg-blue-600 bg-opacity-60 px-3 py-1 rounded-md text-sm font-medium text-white shadow-sm">{weakness}</span>
                                    {/each}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div>
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
                    </div>
                </div>
            </div>
        </div>

        <!-- Selection Card -->
        <div class="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm mb-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center text-gray-700">
                <span class="text-gray-500 mr-2">🎨</span> {$language === 'en' ? 'Select Preferences' : '選擇偏好'}
            </h3>

            <!-- Approach Selection -->
            <div class="mb-6">
                <h4 class="text-md font-medium mb-3 text-gray-600">{$language === 'en' ? 'Choose Path:' : '選擇路徑：'}</h4>
                <div class="flex-wrap gap-3 grid grid-cols-2">
                    <button
                        on:click={() => selectApproach("strengths")}
                        class={`px-5 cursor-pointer py-3 rounded-lg font-medium transition-all duration-300 flex flex-wrap items-center justify-center ${
                            selectedApproach === "strengths"
                                ? "bg-teal-600/90 text-white shadow-sm"
                                : "bg-teal-50 text-teal-700 hover:bg-teal-100 shadow-sm"
                        }`}
                    >
                        <span class="mr-2 text-xl">💪</span> {$language === 'en' ? 'Apply Strengths' : '應用優勢'}
                    </button>
                    <button
                        on:click={() => selectApproach("weaknesses")}
                        class={`px-3 py-3 cursor-pointer rounded-lg font-medium transition-all duration-300 flex flex-wrap items-center justify-center ${
                            selectedApproach === "weaknesses"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"
                        }`}
                    >
                        <span class="mr-2 text-xl">🤔</span> {$language === 'en' ? 'Manage Weaknesses' : '管理劣勢'}
                    </button>
                </div>
            </div>

            <!-- Meal Type Selection -->
            <div>
                <h4 class="text-md font-medium mb-3 text-gray-600">{$language === 'en' ? 'Select Meal:' : '選擇餐點：'}</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        on:click={() => selectMealType("breakfast")}
                        class={`relative cursor-pointer group overflow-hidden px-3 py-3 rounded-lg font-medium transition-all duration-300 ${
                            selectedMealType === "breakfast"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm"
                        }`}
                    >
                        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍳</span>
                            <span class="font-medium">{$language === 'en' ? 'Breakfast' : '早餐'}</span>
                            <div class="particle" style="width: 8px; height: 8px; top: 20%; left: 20%;"></div>
                            <div class="particle" style="width: 6px; height: 6px; top: 60%; left: 80%;"></div>
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
                        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍱</span>
                            <span class="font-medium">{$language === 'en' ? 'Lunch' : '午餐'}</span>
                            <div class="particle" style="width: 7px; height: 7px; top: 30%; left: 70%;"></div>
                            <div class="particle" style="width: 5px; height: 5px; top: 50%; left: 30%;"></div>
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
                        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍲</span>
                            <span class="font-medium">{$language === 'en' ? 'Dinner' : '晚餐'}</span>
                            <div class="particle" style="width: 8px; height: 8px; top: 40%; left: 20%;"></div>
                            <div class="particle" style="width: 6px; height: 6px; top: 70%; left: 60%;"></div>
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
                        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div class="flex flex-col items-center">
                            <span class="text-3xl mb-1">🍦</span>
                            <span class="font-medium">{$language === 'en' ? 'Late Snack' : '宵夜'}</span>
                            <div class="particle" style="width: 7px; height: 7px; top: 25%; left: 75%;"></div>
                            <div class="particle" style="width: 5px; height: 5px; top: 65%; left: 25%;"></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Recommendations Section -->
        <div class="mb-6">
            {#if selectedApproach && selectedMealType}
                <div class="bg-white rounded-xl p-6 md:p-8 shadow-sm">
                    <h3 class="text-xl font-semibold mb-4 flex items-center text-gray-700">
                        <span class="text-gray-500 mr-2">🛤️</span>
                        {getMealTypeTitle(selectedMealType)}
                        <span class="ml-2 text-sm px-3 py-1 rounded-full shadow-sm"
                            class:bg-teal-100={selectedApproach === "strengths"}
                            class:text-teal-700={selectedApproach === "strengths"}
                            class:bg-blue-100={selectedApproach === "weaknesses"}
                            class:text-blue-700={selectedApproach === "weaknesses"}>
                            {$language === 'en' ? (selectedApproach === "strengths" ? "Strength Application" : "Weakness Balancing") : (selectedApproach === "strengths" ? "優勢應用" : "劣勢平衡")}
                        </span>
                    </h3>

                    {#if filteredRecommendations.length > 0}
                        <div class="space-y-4">
                            {#each filteredRecommendations as suggestion, i}
                                <div class="bg-gray-50 rounded-lg p-4 transition-all duration-300 hover:bg-gray-100 shadow-sm">
                                    <div class="flex items-start">
                                        <span class="text-gray-400 font-mono mr-3 text-lg">
                                            {i === filteredRecommendations.length - 1 ? '└' : '├'}
                                        </span>
                                        <span class="text-gray-700 font-medium">{suggestion}</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="bg-gray-50 rounded-lg p-6 text-center">
                            <p class="text-gray-500">{$language === 'en' ? 'No suggestions found for this focus.' : '找不到適合此焦點的建議。'}</p>
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="bg-white rounded-xl p-8 shadow-sm text-center">
                    {#if selectedApproach}
                        <p class="text-gray-600 font-medium text-lg">{$language === 'en' ? 'Please select a meal type to see suggestions' : '請選擇一個餐點類型以查看建議'}</p>
                    {:else if selectedMealType}
                        <p class="text-gray-600 font-medium text-lg">{$language === 'en' ? 'Please select a strength or weakness path to see suggestions' : '請選擇優勢或劣勢路徑以查看建議'}</p>
                    {:else}
                        <p class="text-gray-600 font-medium text-lg">{$language === 'en' ? 'Please select a path and meal type to see suggestions' : '請選擇路徑和餐點類型以查看建議'}</p>
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
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
        0%, 100% {
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
