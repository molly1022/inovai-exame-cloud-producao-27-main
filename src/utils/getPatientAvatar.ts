
/**
 * Retorna a URL do avatar adequado para o paciente:
 * - Se paciente tem foto_perfil_url definida, retorna essa.
 * - Se tem gênero definido, retorna uma imagem padrão para o gênero.
 * - Se tem nome que parece feminino, retorna imagem feminina.
 * - Senão, retorna imagem masculina.
 */
export function getPatientAvatar({
  foto_perfil_url,
  genero,
  sexo,
  nome,
}: {
  foto_perfil_url?: string;
  genero?: string;
  sexo?: string;
  nome?: string;
}) {
  if (foto_perfil_url) return foto_perfil_url;

  const genre = (genero || sexo || "").toLowerCase();
  if (genre === "feminino") {
    // Avatar feminino - corrigido para usar a imagem correta
    return "/lovable-uploads/a963c9f5-0025-420d-9286-f1e813625969.png";
  }
  if (genre === "masculino") {
    // Avatar masculino - corrigido para usar a imagem correta
    return "/lovable-uploads/862300e8-7713-4369-9795-0c50555cff13.png";
  }

  // fallback pelo nome
  const feminineNames = [
    "ana",
    "maria",
    "joana",
    "carla",
    "lucia",
    "fernanda",
    "patricia",
    "claudia",
    "sandra",
    "monica",
    "julia",
    "beatriz",
    "carolina",
    "isabela",
    "gabriela",
    "amanda",
    "rafaela",
    "camila",
    "leticia",
    "mariana"
  ];
  const firstName = nome?.toLowerCase().split(" ")[0] || "";
  const isFeminine = feminineNames.includes(firstName);
  
  return isFeminine
    ? "/lovable-uploads/a963c9f5-0025-420d-9286-f1e813625969.png"
    : "/lovable-uploads/862300e8-7713-4369-9795-0c50555cff13.png";
}
