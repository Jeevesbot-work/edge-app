export interface IngredientGroup {
  heading: string | null;
  items: string[];
}

export interface Recipe {
  id: string;
  title: string;
  section: "breakfast" | "main";
  serves: number;
  macros_per_serving: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  ingredient_groups: IngredientGroup[];
  steps: string[];
  note: string | null;
}

export const RECIPES: Recipe[] = [
  {
    id: "overnight-oats",
    title: "High Protein Overnight Oats",
    section: "breakfast",
    serves: 2,
    macros_per_serving: { calories: 440, protein_g: 38, carbs_g: 50, fat_g: 9 },
    ingredient_groups: [{ heading: null, items: ["80g oats","20g chia seeds","60g (2 scoops) vanilla protein powder","1 tsp cinnamon","150g plain Greek yoghurt","200ml milk","1 tbsp honey or maple syrup","1 tsp vanilla extract"] }],
    steps: ["Combine the oats, chia seeds, protein powder, cinnamon, Greek yoghurt, milk, honey and vanilla in a bowl or jar.","Stir until well combined.","Cover and refrigerate overnight.","In the morning, stir again and add your favourite toppings before serving."],
    note: "The original did not list amounts - these are sensible starting quantities. Adjust the milk/honey to taste.",
  },
  {
    id: "blueberry-muffin-bowl",
    title: "Baked Blueberry Muffin Protein Bowl",
    section: "breakfast",
    serves: 2,
    macros_per_serving: { calories: 280, protein_g: 22, carbs_g: 34, fat_g: 6 },
    ingredient_groups: [{ heading: null, items: ["1 banana","1 large egg","80g Fage Total 0% Greek yoghurt","30g vanilla protein powder","30g oats","40ml milk","5ml vanilla essence","1/2 tsp baking powder","50g blueberries","10g white chocolate chips (optional)"] }],
    steps: ["Mash the banana in a bowl.","Crack the egg into the bowl with the mashed banana.","Add the Greek yoghurt and vanilla essence to the mixture.","Add the protein powder, oats and baking powder to the bowl.","Pour in the milk and mix everything together thoroughly.","Fold in the blueberries and optional white chocolate chips.","Transfer the mixture to an oven-proof dish.","Bake in the oven at 180C for about 30 minutes."],
    note: null,
  },
  {
    id: "banana-bread-baked-oats",
    title: "High Protein Banana Bread Baked Oats",
    section: "breakfast",
    serves: 3,
    macros_per_serving: { calories: 555, protein_g: 37, carbs_g: 76, fat_g: 12 },
    ingredient_groups: [{ heading: null, items: ["150g oats","150g banana","3 salted caramel protein packets","360ml milk","1 tsp baking powder","Sprinkle of salt","6 tbsp vanilla Greek yoghurt","150g bananas heated with a little brown sugar","15g chopped walnuts","15g chocolate chips optional"] }],
    steps: ["Mix the oats, banana, protein, milk, baking powder, salt and yoghurt into a batter and pour into an oven dish.","Top with the brown-sugar bananas, walnuts and chocolate chips.","Bake at 175C for 30 minutes."],
    note: null,
  },
  {
    id: "cottage-cheese-pancakes",
    title: "Cottage Cheese Protein Pancakes",
    section: "breakfast",
    serves: 2,
    macros_per_serving: { calories: 535, protein_g: 29, carbs_g: 65, fat_g: 16 },
    ingredient_groups: [{ heading: null, items: ["200g cottage cheese","3 large eggs","70ml milk","1 tsp vanilla extract","1 tbsp maple syrup","1 tbsp melted butter","130g plain flour","1 tsp baking powder","1/4 tsp baking soda","1/4 tsp salt","1 scoop 30g whey protein optional","Fresh blueberries"] }],
    steps: ["In a large bowl whisk together the cottage cheese, eggs, milk, vanilla extract, maple syrup and melted butter until smooth.","In a separate bowl mix the flour, baking powder, baking soda, salt and the whey protein if using.","Gently fold the dry ingredients into the wet mix - a few lumps are fine.","Carefully fold in the blueberries.","Heat a pan over medium-low heat with a little butter.","Pour roughly a quarter of the mix per pancake.","Cook until bubbles form and the edges set, then flip and cook for another 1 to 2 minutes.","Stack them up, add butter, drizzle maple syrup and enjoy."],
    note: "Macros are without added protein powder. Add a 30g scoop of whey if you want - it will push protein up around 20g per serving.",
  },
  {
    id: "breakfast-boats",
    title: "Protein Breakfast Boats",
    section: "breakfast",
    serves: 8,
    macros_per_serving: { calories: 220, protein_g: 20, carbs_g: 15, fat_g: 9 },
    ingredient_groups: [{ heading: null, items: ["6 medium eggs","160g diced ham","150g plum tomatoes","150g spinach","300g low fat cottage cheese","150g salsa","Taco seasoning","Salt and pepper","Taco boats","136g low fat cheddar"] }],
    steps: ["Preheat the oven to 180C.","Mix everything except the boats and cheese.","Fill the boats evenly.","Top with the cheese.","Bake for 20-25 minutes."],
    note: null,
  },
  {
    id: "honey-garlic-chicken-fried-rice",
    title: "High Protein Crispy Honey Garlic Chicken Fried Rice",
    section: "main",
    serves: 7,
    macros_per_serving: { calories: 610, protein_g: 60, carbs_g: 65, fat_g: 9 },
    ingredient_groups: [
      { heading: null, items: ["1.05kg diced boneless skinless chicken breast","35ml salt reduced soy sauce","2 garlic cloves minced","1/2 tsp black pepper","1 tsp onion powder","1 tsp garlic powder","100g potato starch","500g frozen mixed vegetables","4 eggs plus 200g egg whites","30g spring onion white part only","980g day-old cooked white rice","40ml salt reduced soy sauce","20g spring onion green part only"] },
      { heading: "Honey Garlic Sauce", items: ["5 garlic cloves minced","60ml soy sauce plus 60ml water","100g reduced sugar ketchup","25ml rice wine vinegar","1 tsp cornflour plus 80ml water","80g honey"] }
    ],
    steps: ["Add soy sauce to chicken with garlic, black pepper and onion powder, mix well.","Add to a bag with potato starch and mix until fully coated.","Spray with light cooking oil and air fry until golden and crispy.","To a pan on medium heat add frozen vegetables followed by mixed eggs. Let cook through and mix well.","Add the white spring onion followed by the day-old rice. Add soy sauce, mix, then add green spring onion.","For the sauce: add garlic, equal parts water and soy sauce, ketchup, rice vinegar and cornflour slurry to thicken. Off heat add honey and mix.","Coat the chicken in the sauce, divide into seven servings and enjoy."],
    note: null,
  },
  {
    id: "red-thai-chicken-rice-bake",
    title: "One Tray Red Thai Chicken Rice Bake",
    section: "main",
    serves: 4,
    macros_per_serving: { calories: 525, protein_g: 50, carbs_g: 49, fat_g: 13 },
    ingredient_groups: [{ heading: null, items: ["180g white rice","550g chicken breast diced","200g broccoli","2 peppers diced","110g green beans chopped","60g red Thai curry paste","1 tin reduced fat coconut milk","15g ginger puree","4 tsp lazy garlic","1 tbsp smoked paprika","1 tbsp black pepper","1/2 tbsp chilli flakes","1/2 tbsp salt","Fresh coriander optional","Fresh chilli optional"] }],
    steps: ["Add the rice, chicken, broccoli, peppers and green beans to a large baking dish.","Add the curry paste, ginger, garlic and seasonings.","Pour over the coconut milk and enough water to cover the rice.","Cover tightly with foil.","Bake at 190C for 45 minutes.","Remove the foil and bake for a further 5 minutes.","Garnish with coriander and chilli if using.","Shove it in your face."],
    note: null,
  },
  {
    id: "cheesy-beef-lasagna-rolls",
    title: "Cheesy Beef Lasagna Rolls",
    section: "main",
    serves: 5,
    macros_per_serving: { calories: 265, protein_g: 31, carbs_g: 18, fat_g: 11 },
    ingredient_groups: [
      { heading: "Lasagna Filling", items: ["330g extra lean ground beef","2 tbsp tomato paste","30ml tomato sauce or passata","60g 1% cottage cheese","1 tsp salt","1 tsp garlic powder","1 tsp oregano flakes"] },
      { heading: "To Assemble", items: ["5 low carb tortillas","60ml tomato passata divided","150g low fat shredded mozzarella divided","Parsley for garnish"] }
    ],
    steps: ["Season and cook the ground beef over medium heat for 6 minutes until browned.","Mix in the cottage cheese and tomato paste.","Place tortilla flat, spread sauce, add filling, top with 15g cheese.","Place seam-side down on an air fryer tray. Top with 15g cheese and more sauce.","Air fry or bake for 10 minutes at 205C.","Top with parsley and enjoy."],
    note: null,
  },
  {
    id: "cheesy-chicken-tacos",
    title: "Cheesy Chicken Tacos",
    section: "main",
    serves: 10,
    macros_per_serving: { calories: 290, protein_g: 28, carbs_g: 20, fat_g: 11 },
    ingredient_groups: [
      { heading: null, items: ["900g chicken thighs","10 mini tortillas","1 pepper","1 onion","1 tin black beans 240g drained","100g sweetcorn","1 packet taco seasoning","100g mozzarella cheese","Garlic powder","Salt and pepper","Spray oil"] },
      { heading: "Optional toppings", items: ["0% Greek yoghurt","Salsa","Coriander"] }
    ],
    steps: ["Slice chicken into thin strips and season with taco seasoning, garlic powder, salt and pepper.","Fry the chicken until cooked through and slightly crispy.","Dice onion and pepper and fry in the same pan.","Add sweetcorn and black beans, then add the rest of the taco seasoning.","Add the chicken back and mix everything together.","Spray one side of each tortilla with oil. Fill with taco mix, fold in half and stack upright in a baking dish.","Sprinkle each taco with mozzarella. Bake at 180C for 12-15 mins until golden and crispy.","Top with Greek yoghurt, salsa and coriander."],
    note: null,
  },
  {
    id: "garlic-parmesan-chicken-tenders",
    title: "Garlic Parmesan Chicken Tenders",
    section: "main",
    serves: 2,
    macros_per_serving: { calories: 555, protein_g: 53, carbs_g: 26, fat_g: 26 },
    ingredient_groups: [
      { heading: null, items: ["300g chicken mini fillets","1 large egg","60g cornflakes","40g salted butter melted","1 tsp garlic puree","1 tbsp parmesan"] },
      { heading: "Seasonings", items: ["Salt","Pepper","Paprika","Optional dried coriander"] }
    ],
    steps: ["Crush the cornflakes into crumbs - not dust, you still want crunch.","Season the chicken with salt, pepper, paprika and coriander if using.","Dip the chicken into the egg, then coat in the crushed cornflakes.","Air fry at 180C for around 10 minutes until cooked through and crispy.","Mix the melted butter, garlic puree and parmesan together.","Toss the cooked chicken in the garlic parmesan butter."],
    note: "The 40g butter does most of the fat here - halve it and you will knock around 8g fat off per serving without losing much.",
  },
  {
    id: "crispy-chicken-shawarma",
    title: "High Protein Crispy Chicken Shawarma",
    section: "main",
    serves: 4,
    macros_per_serving: { calories: 710, protein_g: 67, carbs_g: 38, fat_g: 32 },
    ingredient_groups: [
      { heading: "Shawarma Chicken", items: ["900g boneless skinless chicken thighs fat trimmed","80g 0% Greek yoghurt","Juice of half a lemon","2 tsp minced garlic","Shawarma seasoning below"] },
      { heading: "Shawarma Seasoning", items: ["2 tsp smoked paprika","1 tsp garlic powder","1 tsp onion powder","1 tsp allspice","1 tsp cayenne","1 tsp oregano","1/2 tsp cumin","2 tsp salt"] },
      { heading: "Crispy Coating", items: ["3 tbsp avocado oil","2 tbsp tomato paste","Salt to taste","Dried chilli flakes"] },
      { heading: "Garlic Sauce", items: ["120g 0% Greek yoghurt","30g light mayo","1 tsp lemon juice","1 tsp garlic powder","1/2 tsp salt","1 tsp honey optional"] },
      { heading: "To Serve", items: ["4 Lebanese wraps 60g each separated into two layers","Sliced pickles"] }
    ],
    steps: ["Slice the chicken thighs into strips.","Add yoghurt, lemon juice, garlic, shawarma seasoning and tomato paste. Mix well to fully coat. Marinate until ready to cook.","For the garlic sauce, combine all ingredients in a bowl, mix well and set aside.","Bake marinated chicken at 200C for 20-25 minutes. Grill on high for 3-5 minutes to char.","For the crispy coating, mix oil, tomato paste, salt and chilli flakes.","Separate a wrap into two layers. Spread garlic sauce, add shawarma and pickles, roll tightly.","Place wraps in a pan with the coating over medium heat. Baste and roll until golden and crispy on all sides.","Serve hot and enjoy."],
    note: null,
  },
  {
    id: "beef-fajita-flatbreads",
    title: "Beef Fajita Flatbreads",
    section: "main",
    serves: 4,
    macros_per_serving: { calories: 595, protein_g: 40, carbs_g: 54, fat_g: 25 },
    ingredient_groups: [
      { heading: null, items: ["500g beef mince 5% fat","1 bell pepper sliced","1 brown onion sliced","2 large vine tomatoes chopped","3 garlic cloves chopped","2 red chilli peppers sliced","3.5 tsp fajita seasoning","1 tsp smoked paprika","Salt and pepper","1 tbsp olive oil","4 Greek style flatbreads","80g grated cheddar","1 tbsp chopped parsley or coriander"] },
      { heading: "Chipotle Sauce", items: ["1 tbsp soured cream","1 tbsp lighter mayonnaise","1.5 tbsp chipotle hot sauce"] }
    ],
    steps: ["Heat oil, add beef mince and cook until no longer pink. Add seasonings and tomatoes, cook 4-5 minutes. Remove and set aside.","In the same pan cook onion and pepper over high heat for 3-4 minutes. Add garlic, return beef and mix. Turn off heat.","Place flatbreads in a roasting tray. Top with beef mixture, cheese and chilli. Bake at 180C for 6-7 minutes until cheese melts.","Combine chipotle sauce ingredients and drizzle over the flatbreads.","Garnish with parsley or coriander."],
    note: null,
  },
  {
    id: "creamy-paprika-chicken",
    title: "Creamy Paprika Chicken",
    section: "main",
    serves: 3,
    macros_per_serving: { calories: 425, protein_g: 53, carbs_g: 7, fat_g: 14 },
    ingredient_groups: [{ heading: null, items: ["1 tsp smoked paprika","1 tsp paprika","1 tsp mixed herbs","500g chicken breast chopped","1 tbsp olive oil","1 medium onion chopped","10g garlic finely chopped","150ml white wine","250ml chicken stock","1 tsp Dijon mustard","1 tbsp tomato puree","60ml single cream"] }],
    steps: ["Season chicken with smoked paprika, paprika and mixed herbs, salt and pepper.","Heat olive oil over medium-high heat. Cook chicken 3-4 minutes until lightly golden. Remove and set aside.","Reduce heat, add onion and cook 4-5 minutes until softened. Stir in garlic and cook 30 seconds.","Pour in white wine and reduce by half.","Add chicken stock, Dijon mustard and tomato puree. Return chicken to pan. Simmer gently for 6-8 minutes until cooked through.","Stir through single cream and heat for 1-2 minutes. Taste and adjust seasoning.","Serve immediately with pasta, rice or potatoes."],
    note: "Macros are for the chicken and sauce only - add your pasta, rice or potatoes on top.",
  },
];
