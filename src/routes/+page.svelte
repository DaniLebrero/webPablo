<script>
    //@ts-nocheck
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	// Stores
	const cart = writable([]);
	const cartCount = writable(0);
	const cartSubtotal = writable(0);
	const products = writable([]);

	// Component state
	let mobileMenuOpen = false;
	let cartDrawerOpen = false;
	let overlayOpen = false;
	let checkoutModalOpen = false;
	let confirmationModalOpen = false;
	let contactFormLoading = false;
	let orderFormLoading = false;

	// Fetch products from the API
	onMount(async () => {
    try {
        console.log('=== FRONTEND: Fetching products ===');
        console.log('Making request to: http://localhost:5000/api/products');
        
        const response = await fetch('http://localhost:5000/api/products');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        console.log('Data type:', typeof data);
        console.log('Data length:', data.length);
        
        products.set(data);
        console.log('Products set in store');
    } catch (error) {
        console.error('=== FRONTEND ERROR ===');
        console.error('Error fetching products:', error);
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
    }
});

	// Reactive statements
	$: {
		const total = $cart.reduce((sum, item) => sum + item.quantity, 0);
		cartCount.set(total);
	}

	$: {
		const subtotal = $cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		cartSubtotal.set(subtotal);
	}

	// Functions

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function openCartDrawer() {
		cartDrawerOpen = true;
		overlayOpen = true;
	}

	function closeCartDrawer() {
		cartDrawerOpen = false;
		overlayOpen = false;
	}

	function closeOverlay() {
		cartDrawerOpen = false;
		overlayOpen = false;
		checkoutModalOpen = false;
		confirmationModalOpen = false;
	}

	function addToCart(product) {
		cart.update((items) => {
			const existingItem = items.find((item) => item.id === product.id);

			if (existingItem) {
				return items.map((item) =>
					item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
				);
			} else {
				return [...items, { ...product, quantity: 1 }];
			}
		});

		openCartDrawer();
	}

	// CORREGIDO: Parámetros tipados correctamente
	function updateQuantity(id, change) {
		cart.update((items) => {
			return items
				.map((item) => {
					if (item.id === id) {
						const newQuantity = item.quantity + change;
						return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
					}
					return item;
				})
				.filter((item) => item !== null); // CORREGIDO: filter más explícito
		});
	}

	function removeFromCart(id) {
		cart.update((items) => items.filter((item) => item.id !== id));
	}

	function openCheckout() {
		if ($cart.length === 0) {
			alert('Your cart is empty');
			return;
		}

		cartDrawerOpen = false;
		checkoutModalOpen = true;
	}

	function closeCheckout() {
		checkoutModalOpen = false;
		overlayOpen = false;
	}

	// CORREGIDO: Tipado del evento
	async function handleContactSubmit(event) {
		event.preventDefault();
		contactFormLoading = true;

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// CORREGIDO: Verificar que target es un formulario
		if (event.target instanceof HTMLFormElement) {
			event.target.reset();
		}
		contactFormLoading = false;
		alert('Message sent successfully! We will get back to you soon.');
	}

	// CORREGIDO: Tipado del evento
	async function handleOrderSubmit(event) {
		event.preventDefault();
		orderFormLoading = true;

		// Simulate order processing
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// CORREGIDO: Verificar que target es un formulario
		if (event.target instanceof HTMLFormElement) {
			event.target.reset();
		}
		orderFormLoading = false;
		checkoutModalOpen = false;
		confirmationModalOpen = true;

		// Clear cart after order
		setTimeout(() => {
			cart.set([]);
		}, 100);
	}

	function closeConfirmation() {
		confirmationModalOpen = false;
		overlayOpen = false;
	}
</script>

<svelte:head>
	<title>Top and Performance</title>
	<script src="https://cdn.tailwindcss.com"></script>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
	/>
	<script>
		tailwind.config = {
			theme: {
				extend: {
					colors: {
						'brand-green': '#32CD32',
						'brand-black': '#000000'
					}
				}
			}
		};
	</script>
</svelte:head>

<div class="flex min-h-screen flex-col bg-black text-white">
	<!-- Header -->
	<header class="bg-brand-black border-brand-green/30 sticky top-0 z-50 border-b shadow-lg">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<!-- Logo -->
				<a
					href="/"
					class="text-brand-green text-2xl font-bold"
					style="text-shadow: 0 0 5px rgba(50, 205, 50, 0.5);"
				>
					Top and Performance
				</a>

				<!-- Navigation -->
				<nav class="hidden items-center space-x-8 md:flex">
					<a href="#home" class="hover:text-brand-green text-white transition">Home</a>
					<a href="#products" class="hover:text-brand-green text-white transition">Products</a>
					<a href="#about" class="hover:text-brand-green text-white transition">About Us</a>
					<a href="#contact" class="hover:text-brand-green text-white transition">Contact</a>
				</nav>

				<!-- Cart Icon -->
				<div class="relative">
					<button
						on:click={openCartDrawer}
						class="hover:text-brand-green relative p-2 text-white transition"
					>
						<i class="fas fa-shopping-cart text-xl"></i>
						<span
							class="bg-brand-green absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-black"
						>
							{$cartCount}
						</span>
					</button>
				</div>

				<!-- Mobile Menu Button -->
				<button on:click={toggleMobileMenu} class="hover:text-brand-green text-white md:hidden">
					<i class="fas fa-bars text-xl"></i>
				</button>
			</div>

			<!-- Mobile Menu -->
			{#if mobileMenuOpen}
				<div class="mt-4 pb-4 md:hidden">
					<nav class="flex flex-col space-y-4">
						<a href="#home" class="hover:text-brand-green text-white transition">Home</a>
						<a href="#products" class="hover:text-brand-green text-white transition">Products</a>
						<a href="#about" class="hover:text-brand-green text-white transition">About Us</a>
						<a href="#contact" class="hover:text-brand-green text-white transition">Contact</a>
					</nav>
				</div>
			{/if}
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-grow">
		<!-- Hero Section -->
		<section
			id="home"
			class="flex h-[500px] w-full items-center justify-center bg-cover bg-center text-center"
			style="background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://cdn.pixabay.com/photo/2016/12/05/19/49/gym-1884687_1280.jpg');"
		>
			<div class="container mx-auto px-4">
				<h1
					class="text-brand-green mb-4 text-4xl font-bold md:text-6xl"
					style="text-shadow: 0 0 5px rgba(50, 205, 50, 0.5);"
				>
					Fuel Your Performance
				</h1>
				<p class="mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
					Premium sports supplements for athletes and fitness enthusiasts.
				</p>
				<button
					class="bg-brand-green hover:bg-brand-green/90 transform rounded-md px-8 py-3 font-bold text-black transition hover:-translate-y-1 hover:shadow-lg"
				>
					Buy Now
				</button>
			</div>
		</section>

		<!-- Products Section -->
		<section id="products" class="bg-black py-16">
			<div class="container mx-auto px-4">
				<h2 class="text-brand-green mb-12 text-center text-3xl font-bold">Featured Products</h2>

				<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each $products as product}
						<div
							class="overflow-hidden rounded-lg border border-gray-800 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
						>
							<img src={product.image} alt={product.name} class="h-48 w-full object-cover" />
							<div class="p-4">
								<h3 class="mb-2 text-lg font-semibold">{product.name}</h3>
								<p class="mb-4 text-sm text-gray-400">{product.description}</p>
								<div class="flex items-center justify-between">
									<span class="text-brand-green font-bold">${product.price.toFixed(2)}</span>
									<button
										on:click={() => addToCart(product)}
										class="bg-brand-green hover:bg-brand-green/90 transform rounded-md px-4 py-2 text-sm font-bold text-black transition hover:-translate-y-1 hover:shadow-lg"
									>
										Add to Cart
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- About Us Section -->
		<section id="about" class="bg-gray-950 py-16">
			<div class="container mx-auto px-4">
				<div class="flex flex-col items-center gap-12 md:flex-row">
					<div class="md:w-1/2">
						<h2 class="text-brand-green mb-6 text-3xl font-bold">About Top and Performance</h2>
						<p class="mb-4 text-gray-300">
							Founded in 2020, Top and Performance has quickly become the premier destination for
							fitness enthusiasts looking to enhance their physical performance and achieve their
							health goals.
						</p>
						<p class="mb-4 text-gray-300">
							Our team consists of passionate fitness experts, nutritionists, and certified personal
							trainers who understand the science behind supplementation and can provide expert
							advice on all our products.
						</p>
						<p class="mb-4 text-gray-300">
							We pride ourselves on offering only the highest quality supplements, sourced from
							reputable manufacturers around the world. Every product in our catalog has been
							thoroughly tested to ensure it meets our rigorous standards for purity, potency, and
							value.
						</p>
						<p class="text-gray-300">
							Whether you're a professional athlete, dedicated gym-goer, or just starting your
							fitness journey, we're here to help you achieve your health and performance goals with
							premium nutritional support.
						</p>
					</div>
					<div class="md:w-1/2">
						<img
							src="https://cdn.pixabay.com/photo/2019/12/18/00/34/body-4703376_1280.jpg"
							alt="Our Lab"
							class="border-brand-green/30 rounded-lg border shadow-2xl"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Contact Section -->
		<section id="contact" class="bg-black py-16">
			<div class="container mx-auto px-4">
				<h2 class="text-brand-green mb-12 text-center text-3xl font-bold">Get In Touch</h2>

				<div class="mx-auto max-w-2xl rounded-lg border border-gray-800 bg-gray-900 p-8">
					<form on:submit={handleContactSubmit} class="space-y-6">
						<div>
							<label for="name" class="mb-2 block text-gray-300">Name</label>
							<input
								type="text"
								id="name"
								name="name"
								class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:ring-2 focus:outline-none"
								required
							/>
						</div>

						<div>
							<label for="email" class="mb-2 block text-gray-300">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:ring-2 focus:outline-none"
								required
							/>
						</div>

						<div>
							<label for="message" class="mb-2 block text-gray-300">Message</label>
							<textarea
								id="message"
								name="message"
								rows="5"
								class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:ring-2 focus:outline-none"
								required
							></textarea>
						</div>

						<button
							type="submit"
							class="bg-brand-green hover:bg-brand-green/90 w-full transform rounded-md py-3 font-bold text-black transition hover:-translate-y-1 hover:shadow-lg {contactFormLoading
								? 'cursor-not-allowed opacity-50'
								: ''}"
							disabled={contactFormLoading}
						>
							{#if contactFormLoading}
								<div class="flex items-center justify-center">
									<div class="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-black"></div>
									Sending...
								</div>
							{:else}
								Submit
							{/if}
						</button>
					</form>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-brand-green/30 border-t bg-gray-900 py-8">
		<div class="container mx-auto px-4">
			<div class="flex flex-col items-center justify-between md:flex-row">
				<div class="mb-4 md:mb-0">
					<h3 class="text-brand-green text-xl font-bold">Top and Performance</h3>
					<p class="mt-2 text-gray-400">Premium sports supplements and nutrition</p>
				</div>

				<div class="flex space-x-6">
					<a href="#" class="hover:text-brand-green text-gray-400 transition">
						<i class="fab fa-facebook-f"></i>
					</a>
					<a href="#" class="hover:text-brand-green text-gray-400 transition">
						<i class="fab fa-instagram"></i>
					</a>
					<a href="#" class="hover:text-brand-green text-gray-400 transition">
						<i class="fab fa-twitter"></i>
					</a>
					<a href="#" class="hover:text-brand-green text-gray-400 transition">
						<i class="fab fa-youtube"></i>
					</a>
				</div>
			</div>

			<div class="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
				<p>&copy; 2025 Top and Performance. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<!-- Cart Drawer -->
{#if cartDrawerOpen}
	<div
		class="border-brand-green/30 fixed top-0 right-0 z-50 h-full w-full transform overflow-y-auto border-l bg-gray-900 transition-transform duration-300 sm:w-96 {cartDrawerOpen
			? 'translate-x-0'
			: 'translate-x-full'}"
	>
		<div class="p-6">
			<div class="mb-6 flex items-center justify-between">
				<h3 class="text-brand-green text-xl font-bold">Your Cart</h3>
				<button on:click={closeCartDrawer} class="text-gray-400 hover:text-white">
					<i class="fas fa-times text-xl"></i>
				</button>
			</div>

			<div class="space-y-4">
				{#if $cart.length === 0}
					<div class="py-8 text-center text-gray-400">Your cart is empty</div>
				{:else}
					{#each $cart as item}
						<div class="flex items-center border-b border-gray-800 pb-4">
							<img src={item.image} alt={item.name} class="h-16 w-16 rounded-md object-cover" />
							<div class="ml-4 flex-grow">
								<h4 class="font-semibold text-white">{item.name}</h4>
								<div class="mt-2 flex items-center justify-between">
									<span class="text-brand-green">${item.price.toFixed(2)}</span>
									<div class="flex items-center">
										<button
											on:click={() => updateQuantity(item.id, -1)}
											class="px-2 text-gray-400 hover:text-white">-</button
										>
										<span class="mx-2 text-white">{item.quantity}</span>
										<button
											on:click={() => updateQuantity(item.id, 1)}
											class="px-2 text-gray-400 hover:text-white">+</button
										>
										<button
											on:click={() => removeFromCart(item.id)}
											class="ml-4 text-gray-400 hover:text-red-500"
										>
											<i class="fas fa-trash-alt"></i>
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<div class="mt-6 border-t border-gray-800 pt-6">
				<div class="mb-4 flex justify-between">
					<span class="text-gray-300">Subtotal:</span>
					<span class="text-brand-green font-bold">${$cartSubtotal.toFixed(2)}</span>
				</div>

				<button
					on:click={openCheckout}
					class="bg-brand-green hover:bg-brand-green/90 w-full transform rounded-md py-3 font-bold text-black transition hover:-translate-y-1 hover:shadow-lg {$cart.length ===
					0
						? 'cursor-not-allowed opacity-50'
						: ''}"
					disabled={$cart.length === 0}
				>
					Checkout
				</button>

				<button
					on:click={closeCartDrawer}
					class="border-brand-green text-brand-green hover:bg-brand-green/10 mt-3 w-full rounded-md border bg-transparent py-3 font-bold transition"
				>
					Continue Shopping
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Overlay -->
{#if overlayOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity duration-300"
		on:click={closeOverlay}
		role="button"
		tabindex="0"
		on:keypress={(e) => e.key === 'Enter' && closeOverlay()}
	></div>
{/if}

<!-- Checkout Modal -->
{#if checkoutModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div
			class="border-brand-green/30 mx-4 w-full max-w-md overflow-hidden rounded-lg border bg-gray-900"
		>
			<div class="p-6">
				<div class="mb-6 flex items-center justify-between">
					<h3 class="text-brand-green text-xl font-bold">Checkout</h3>
					<button on:click={closeCheckout} class="text-gray-400 hover:text-white">
						<i class="fas fa-times"></i>
					</button>
				</div>

				<form on:submit={handleOrderSubmit} class="space-y-4">
					<div>
						<label for="fullName" class="mb-2 block text-gray-300">Full Name</label>
						<input
							type="text"
							id="fullName"
							name="fullName"
							class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:outline-none"
							required
						/>
					</div>

					<div>
						<label for="checkoutEmail" class="mb-2 block text-gray-300">Email</label>
						<input
							type="email"
							id="checkoutEmail"
							name="email"
							class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:outline-none"
							required
						/>
					</div>

					<div>
						<label for="address" class="mb-2 block text-gray-300">Address</label>
						<input
							type="text"
							id="address"
							name="address"
							class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:outline-none"
							required
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="city" class="mb-2 block text-gray-300">City</label>
							<input
								type="text"
								id="city"
								name="city"
								class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:outline-none"
								required
							/>
						</div>

						<div>
							<label for="zip" class="mb-2 block text-gray-300">ZIP Code</label>
							<input
								type="text"
								id="zip"
								name="zip"
								class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:outline-none"
								required
							/>
						</div>
					</div>

					<div class="mt-6">
						<button
							type="submit"
							class="bg-brand-green hover:bg-brand-green/90 w-full transform rounded-md py-3 font-bold text-black transition hover:-translate-y-1 hover:shadow-lg {orderFormLoading
								? 'cursor-not-allowed opacity-50'
								: ''}"
							disabled={orderFormLoading}
						>
							{#if orderFormLoading}
								<div class="flex items-center justify-center">
									<div class="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-black"></div>
									Processing...
								</div>
							{:else}
								Confirm Order
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Order Confirmation Modal -->
{#if confirmationModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div
			class="border-brand-green/30 mx-4 w-full max-w-md overflow-hidden rounded-lg border bg-gray-900"
		>
			<div class="p-6">
				<div class="mb-6 flex items-center justify-between">
					<h3 class="text-brand-green text-xl font-bold">Order Confirmed</h3>
					<button on:click={closeConfirmation} class="text-gray-400 hover:text-white">
						<i class="fas fa-times"></i>
					</button>
				</div>

				<div class="mb-6 text-center">
					<div class="text-brand-green mb-4">
						<i class="fas fa-check-circle text-5xl"></i>
					</div>
					<h4 class="mb-2 text-xl font-bold text-white">Thank You for Your Order!</h4>
					<p class="text-gray-300">
						Your order has been confirmed. An email confirmation has been sent to your email
						address.
					</p>
				</div>

				<div class="mb-6 rounded-md bg-gray-800 p-4">
					<h5 class="mb-3 font-bold text-white">Order Summary:</h5>
					<div class="mb-3 space-y-2">
						{#each $cart as item}
							<div class="flex justify-between text-gray-300">
								<span>{item.name} × {item.quantity}</span>
								<span>${(item.price * item.quantity).toFixed(2)}</span>
							</div>
						{/each}
					</div>
					<div class="flex justify-between border-t border-gray-700 pt-3">
						<span class="font-bold text-white">Total:</span>
						<span class="text-brand-green font-bold">${$cartSubtotal.toFixed(2)}</span>
					</div>
				</div>

				<button
					on:click={closeConfirmation}
					class="bg-brand-green hover:bg-brand-green/90 w-full transform rounded-md py-3 font-bold text-black transition hover:-translate-y-1 hover:shadow-lg"
				>
					Continue Shopping
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		background-color: #000;
		color: white;
		font-family: 'Inter', sans-serif;
	}
</style>