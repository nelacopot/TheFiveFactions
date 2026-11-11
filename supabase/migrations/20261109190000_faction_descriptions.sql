update public.factions
set description = case name
  when 'Grit' then $description$This faction is dedicated to courage, bravery, physical and emotional strength, and fearlessness. Choose this faction if you would like to become physically and mentally strong.$description$
  when 'Altruism' then $description$This faction values the needs of others above its own. Its core belief is “Them before I.” Choose this faction if you would like to help others more.$description$
  when 'Verity' then $description$Members see honesty and trustworthiness as the foundations of morality and character. Choose this faction if you value truth and justice.$description$
  when 'Intellect' then $description$Members focus their lives on the pursuit of knowledge through books, research, and exploring information on computers. Choose this faction if you would like to learn more about the world, develop better thinking, and use your mind more.$description$
  when 'Harmony' then $description$This faction is dedicated to peacefulness, kindness, forgiveness, trust, self-sufficiency, and neutrality. Choose this faction if you would like to find inner peace, grow spiritually, learn more about nature, and get in touch with yourself.$description$
  else description
end
where name in ('Grit', 'Altruism', 'Verity', 'Intellect', 'Harmony');
