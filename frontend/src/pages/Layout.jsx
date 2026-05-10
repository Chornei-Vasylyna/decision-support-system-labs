import { Outlet } from "react-router";
import { Tab } from "@/ui/Tab";

export const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col bg-stone-100">
			<header className="bg-stone-400/60 border-b border-stone-400/40 px-8 py-4">
				<div>
					<h1 className="text-lg font-semibold text-stone-800 tracking-tight">
						СППР
					</h1>
					<p className="text-sm text-stone-600 mt-0.5">
						Decision Support System
					</p>
				</div>
			</header>

			<nav className="bg-stone-200/70 border-b border-stone-300/60 px-8">
				<div className="max-w-6xl mx-auto flex overflow-x-auto gap-2">
					<Tab to="/" label="Альтернативи" />
					<Tab to="/criteria" label="Критерії" />
					<Tab to="/matrix" label="Матриця" />
					<Tab to="/voting" label="Голосування" />
					<Tab to="/engine" label="Система прийняття рішень" />
					<Tab to="/constraints" label="Обмеження" />
					<Tab to="/rules" label="Правила" />
					<Tab to="/analysis" label="Аналіз" />
					<Tab to="/explanation" label="Пояснення" />
				</div>
			</nav>

			<main className="flex-1 max-w-6xl mx-auto w-full p-8">
				<Outlet />
			</main>

			<footer className="bg-stone-400/60 border-t border-stone-400/40 text-center py-3 text-sm text-stone-700">
				© 2026 Decision Support System
			</footer>
		</div>
	);
};
